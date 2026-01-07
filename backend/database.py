import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
cluster = os.getenv("MONGO_CLUSTER")
app_name = os.getenv("MONGO_APP_NAME")

encoded_username = quote_plus(username)
encoded_password = quote_plus(password)

MONGO_URI = f"mongodb+srv://{encoded_username}:{encoded_password}@{cluster}/?appName={app_name}"

client = MongoClient(MONGO_URI)

db = client["eduscore_ai"]

users_collection = db["users"]
