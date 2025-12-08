import sqlite3
import os

# Path to the database file
DB_PATH = os.path.join(os.path.dirname(__file__), "abfrl.db")

def migrate():
    print(f"Connecting to database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(carts)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "applied_discount_code" not in columns:
            print("Adding applied_discount_code column to carts table...")
            cursor.execute("ALTER TABLE carts ADD COLUMN applied_discount_code VARCHAR")
            conn.commit()
            print("Migration successful.")
        else:
            print("Column applied_discount_code already exists.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
