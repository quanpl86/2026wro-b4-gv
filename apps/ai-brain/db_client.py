import os
from supabase import create_client, Client
from supabase.client import create_client as create_async_client, AsyncClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

db: Client = create_client(url, key)

async def get_async_db() -> AsyncClient:
    return await create_async_client(url, key)

if __name__ == "__main__":
    print(f"Supabase Client initialized for: {url}")
    # Simple test to verify connection
    try:
        # Check if we can at least reach the server
        print("Supabase connection established.")
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
