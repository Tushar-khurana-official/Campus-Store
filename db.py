import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/campus_store")

# Fallback in-memory mock database for seeding
SEED_PRODUCTS = [
  {
    "id": "apex-run",
    "name": "Campus Apex-Run",
    "category": "Running",
    "price": 129.99,
    "originalPrice": 159.99,
    "rating": 4.9,
    "reviewsCount": 184,
    "image": "assets/images/run-apex.png",
    "description": "Engineered for high-mileage runs, the Apex-Run features a carbon-fiber reinforced mesh structure and responsive air-cushion sole for ultimate energy return.",
    "badge": "Best Seller",
    "colors": ["#FF6B35", "#1E293B", "#00ADB5"],
    "sizes": [7, 8, 9, 10, 11]
  },
  {
    "id": "velocity-x",
    "name": "Campus Velocity-X",
    "category": "Running",
    "price": 159.99,
    "rating": 4.9,
    "reviewsCount": 92,
    "image": "assets/images/run-velocity.png",
    "description": "Designed for lightweight speed, the Velocity-X wraps your foot in a breathable, adaptive mesh with specialized high-grip traction for wet surfaces.",
    "badge": "New Launch",
    "colors": ["#00ADB5", "#1E293B", "#FF6B35"],
    "sizes": [8, 9, 10, 11]
  },
  {
    "id": "aero-strider",
    "name": "Campus Aero-Strider",
    "category": "Athletic",
    "price": 149.99,
    "originalPrice": 179.99,
    "rating": 4.9,
    "reviewsCount": 148,
    "image": "assets/images/athletic-strider.png",
    "description": "The ultimate cross-trainer. Aero-Strider offers dual-density foam midsoles and a lateral stability wrap to support quick multi-directional movements in the gym or court.",
    "badge": "15% OFF",
    "colors": ["#00ADB5", "#FF6B35", "#FFFFFF"],
    "sizes": [7, 8, 9, 10, 11]
  },
  {
    "id": "trail-blazer",
    "name": "Campus Trail-Blazer",
    "category": "Athletic",
    "price": 139.99,
    "rating": 4.8,
    "reviewsCount": 76,
    "image": "assets/images/athletic-trail.png",
    "description": "Rugged terrain requires rugged gear. The Trail-Blazer has a mud-guard shell, protective toe cap, and deep multi-directional lugs for running and hiking on dirt, rocks, and mud.",
    "badge": "Rugged Edition",
    "colors": ["#30475E", "#FF6B35", "#1E293B"],
    "sizes": [8, 9, 10]
  },
  {
    "id": "glide-on",
    "name": "Campus Glide-On",
    "category": "Casual",
    "price": 89.99,
    "originalPrice": 99.99,
    "rating": 4.8,
    "reviewsCount": 212,
    "image": "assets/images/casual-glide.png",
    "description": "Slip into comfort with the Glide-On lifestyle slip-on shoe. Features a memory foam insole and slip-resistant stretch-knit fabric for daily casual wear.",
    "badge": "Pure Comfort",
    "colors": ["#172A45", "#30475E", "#1E293B"],
    "sizes": [7, 8, 9, 10, 11]
  },
  {
    "id": "court-classic",
    "name": "Campus Court-Classic",
    "category": "Casual",
    "price": 109.99,
    "rating": 4.9,
    "reviewsCount": 125,
    "image": "assets/images/casual-classic.png",
    "description": "Retro heritage meets modern cushioning. Crafted with premium white synthetic leather and athletic styling details, the Court-Classic complements any casual street look.",
    "badge": "Street Icon",
    "colors": ["#FFFFFF", "#FF6B35", "#1E293B"],
    "sizes": [8, 9, 10]
  }
]

# Database State
client = None
db = None
USE_MOCK_DB = False

# Mock In-Memory DB collections
MOCK_PRODUCTS = list(SEED_PRODUCTS)
MOCK_ORDERS = []

try:
    print(f"Connecting to MongoDB at: {MONGO_URI}...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    # Check connection
    client.server_info()
    db = client.get_database()
    print("Successfully connected to MongoDB.")
except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
    print("Warning: Could not connect to local MongoDB. Falling back to in-memory mock database layer.", file=sys.stderr)
    USE_MOCK_DB = True
    client = None
    db = None

def get_db():
    global db, USE_MOCK_DB
    if USE_MOCK_DB:
        return None
    return db

def is_mock_db():
    return USE_MOCK_DB

def seed_db():
    global MOCK_PRODUCTS
    if USE_MOCK_DB:
        print("Mock DB in-use. Seeding not required (using in-memory default array).")
        return MOCK_PRODUCTS

    database = get_db()
    products_col = database["products"]
    
    # Check count
    count = products_col.count_documents({})
    if count == 0:
        print("Products database is empty. Seeding catalog items...")
        products_col.insert_many(SEED_PRODUCTS)
        print(f"Seeded {len(SEED_PRODUCTS)} products.")
    else:
        print(f"Products collection already contains {count} items. Seeding skipped.")

# Run seeding on module import
try:
    seed_db()
except Exception as e:
    print(f"Seeding process encountered an error: {e}", file=sys.stderr)
