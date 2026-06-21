import os
import sys
import hmac
import hashlib
import json
import datetime
from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv

import db

load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')

# Configuration
PORT = int(os.getenv("PORT", 5173))
KEY_ID = os.getenv("RAZORPAY_KEY_ID", "your_razorpay_key_id")
KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "your_razorpay_key_secret")
WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# Verify if we should run Razorpay in Mock Mode
IS_RAZORPAY_MOCK = (KEY_ID == "your_razorpay_key_id" or not KEY_ID)
razorpay_client = None

if IS_RAZORPAY_MOCK:
    print("WARNING: Razorpay credentials are using placeholder values. Payment flow will run in MOCK MODE.")
else:
    try:
        import razorpay
        razorpay_client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))
        print("Razorpay client successfully initialized.")
    except ImportError:
        print("Warning: 'razorpay' package not found or fails to import. Running in Mock Mode.", file=sys.stderr)
        IS_RAZORPAY_MOCK = True
    except Exception as e:
        print(f"Warning: Failed to connect to Razorpay: {e}. Running in Mock Mode.", file=sys.stderr)
        IS_RAZORPAY_MOCK = True

# Conversion rate for demonstration purposes (1 USD = 83 INR)
USD_TO_INR_RATE = 83.0

# --- Helper functions ---
def get_product_by_slug(slug_id):
    """Fetch product from database or local mock dictionary by its unique slug ID"""
    if db.is_mock_db():
        return next((p for p in db.MOCK_PRODUCTS if p["id"] == slug_id), None)
    
    database = db.get_db()
    return database["products"].find_one({"id": slug_id})

def serialize_mongo_doc(doc):
    """Serialize MongoDB BSON document to JSON-compatible dictionary"""
    if not doc:
        return None
    serializable = dict(doc)
    if "_id" in serializable:
        serializable["_id"] = str(serializable["_id"])
    return serializable

# --- Static Routes ---
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# --- Products API routes ---
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        if db.is_mock_db():
            return jsonify(db.MOCK_PRODUCTS)
        
        database = db.get_db()
        cursor = database["products"].find({})
        products = [serialize_mongo_doc(doc) for doc in cursor]
        return jsonify(products)
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve products: {str(e)}"}), 500

@app.route('/api/products/seed', methods=['POST'])
def seed_products_endpoint():
    try:
        db.seed_db()
        return jsonify({"message": "Products seeded successfully."})
    except Exception as e:
        return jsonify({"error": f"Seeding failed: {str(e)}"}), 500

# --- Checkout API routes ---
@app.route('/api/checkout', methods=['POST'])
def create_checkout_order():
    try:
        data = request.get_json() or {}
        items = data.get("items", [])
        customer_details = data.get("customerDetails", {})

        if not items:
            return jsonify({"error": "Shopping cart is empty."}), 400

        # Server-side validation of prices and calculation of subtotal
        subtotal_usd = 0.0
        validated_items = []

        for cart_item in items:
            prod_id = cart_item.get("id")
            quantity = int(cart_item.get("quantity", 1))
            size = cart_item.get("size")
            color = cart_item.get("color")

            db_product = get_product_by_slug(prod_id)
            if not db_product:
                return jsonify({"error": f"Product {prod_id} not found in database catalog."}), 400

            price_usd = float(db_product["price"])
            item_total = price_usd * quantity
            subtotal_usd += item_total

            validated_items.append({
                "id": prod_id,
                "name": db_product["name"],
                "price": price_usd,
                "quantity": quantity,
                "size": size,
                "color": color,
                "image": db_product["image"]
            })

        # Calculate Shipping (Free over $150)
        shipping_usd = 0.0 if subtotal_usd > 150.0 else 12.99
        tax_usd = subtotal_usd * 0.08
        total_usd = subtotal_usd + shipping_usd + tax_usd

        # Convert to INR for Razorpay (requires integer currency subunits - Paise)
        total_inr = total_usd * USD_TO_INR_RATE
        amount_paise = int(total_inr * 100)

        # Generate unique transaction receipt
        receipt_id = f"receipt_ord_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

        order_id = ""
        mock_mode_active = IS_RAZORPAY_MOCK

        if mock_mode_active:
            # Generate simulated mock order ID
            import uuid
            order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
            print(f"[MOCK CHECKOUT] Generated mock Razorpay Order ID: {order_id}")
        else:
            try:
                # Call Razorpay SDK to create order
                razorpay_order = razorpay_client.order.create({
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": receipt_id,
                    "payment_capture": 1
                })
                order_id = razorpay_order["id"]
            except Exception as e:
                print(f"Error calling Razorpay API: {e}. Falling back to Sandbox Mode.", file=sys.stderr)
                import uuid
                order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
                mock_mode_active = True

        # Save order document in Database
        order_doc = {
            "razorpayOrderId": order_id,
            "razorpayPaymentId": "",
            "customerDetails": customer_details,
            "items": validated_items,
            "amountUSD": round(total_usd, 2),
            "amountINR": round(total_inr, 2),
            "status": "Pending",
            "createdAt": datetime.datetime.utcnow().isoformat()
        }

        if db.is_mock_db():
            db.MOCK_ORDERS.append(order_doc)
        else:
            database = db.get_db()
            database["orders"].insert_one(order_doc)

        return jsonify({
            "order_id": order_id,
            "amount": amount_paise,
            "currency": "INR" if not mock_mode_active else "USD",
            "key_id": KEY_ID,
            "mock_mode": mock_mode_active
        })

    except Exception as e:
        return jsonify({"error": f"Checkout process failed: {str(e)}"}), 500

@app.route('/api/checkout/verify', methods=['POST'])
def verify_checkout_signature():
    try:
        data = request.get_json() or {}
        payment_id = data.get("razorpay_payment_id")
        order_id = data.get("razorpay_order_id")
        signature = data.get("razorpay_signature")

        if not order_id:
            return jsonify({"error": "Missing order reference."}), 400

        # Check if order was created in mock mode
        is_mock_order = order_id.startswith("order_mock_") or IS_RAZORPAY_MOCK

        if is_mock_order:
            # Update order in DB
            update_order_status(order_id, "Paid", payment_id or "pay_mock_12345")
            return jsonify({"status": "success", "message": "Simulated payment successfully verified."})

        # Cryptographic verification of Razorpay signature
        msg = f"{order_id}|{payment_id}".encode('utf-8')
        generated_signature = hmac.new(
            KEY_SECRET.encode('utf-8'),
            msg,
            hashlib.sha256
        ).hexdigest()

        if generated_signature == signature:
            # Update order in DB
            update_order_status(order_id, "Paid", payment_id)
            return jsonify({"status": "success", "message": "Payment signature successfully verified."})
        else:
            update_order_status(order_id, "Failed")
            return jsonify({"error": "Cryptographic payment verification failed."}), 400

    except Exception as e:
        return jsonify({"error": f"Verification failed: {str(e)}"}), 500

def update_order_status(order_id, status, payment_id=""):
    """Helper function to update database order record status"""
    if db.is_mock_db():
        for order in db.MOCK_ORDERS:
            if order["razorpayOrderId"] == order_id:
                order["status"] = status
                order["razorpayPaymentId"] = payment_id
                print(f"[MOCK DB] Order {order_id} updated to {status}.")
                break
        return

    try:
        database = db.get_db()
        database["orders"].update_one(
            {"razorpayOrderId": order_id},
            {"$set": {"status": status, "razorpayPaymentId": payment_id}}
        )
        print(f"[MONGODB] Order {order_id} updated to {status} with payment ID {payment_id}.")
    except Exception as e:
        print(f"Error updating order status in MongoDB: {e}", file=sys.stderr)

# --- Razorpay Webhook API Route ---
@app.route('/api/payment-webhook', methods=['POST'])
def payment_webhook():
    try:
        raw_body = request.get_data()
        received_signature = request.headers.get('X-Razorpay-Signature', '')

        # Skip verification if webhook secret not set for sandbox ease
        if not WEBHOOK_SECRET:
            print("Warning: Webhook secret not configured. Parsing webhook payload without verification.")
        else:
            generated_signature = hmac.new(
                WEBHOOK_SECRET.encode('utf-8'),
                raw_body,
                hashlib.sha256
            ).hexdigest()

            if generated_signature != received_signature:
                return jsonify({"error": "Invalid webhook signature."}), 401

        event_payload = json.loads(raw_body.decode('utf-8'))
        event_name = event_payload.get("event")
        
        print(f"[WEBHOOK RECEIVED] Event: {event_name}")

        if event_name == "payment.captured":
            payment_entity = event_payload.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")
            if order_id:
                update_order_status(order_id, "Paid", payment_id)

        elif event_name == "payment.failed":
            payment_entity = event_payload.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            if order_id:
                update_order_status(order_id, "Failed")

        return jsonify({"status": "ok"})

    except Exception as e:
        print(f"Webhook processing error: {e}", file=sys.stderr)
        return jsonify({"error": f"Webhook execution error: {str(e)}"}), 500

if __name__ == '__main__':
    print(f"Starting Campus Store server on http://localhost:{PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=True)
