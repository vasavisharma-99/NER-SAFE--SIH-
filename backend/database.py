import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nersafe.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Reports table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hazard_type TEXT NOT NULL,
            description TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            photo_name TEXT,
            status TEXT DEFAULT 'PENDING',
            created_at TEXT NOT NULL
        )
    """)

    # Alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            area TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Seed sample alert if table is empty
    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO alerts (area, risk_level, message, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            "Gangtok, Sikkim",
            "HIGH-RISK WARNING",
            "Heavy monsoon rainfall has increased landslide vulnerability along NH-10. Avoid non-essential travel on slope sectors.",
            now
        ))

    # Seed sample reports if table is empty
    cursor.execute("SELECT COUNT(*) FROM reports")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        sample_reports = [
            (
                "Landslide",
                "Minor debris slip on NH-10 near Rangpo corridor. One lane blocked with gravel and mud.",
                27.1772,
                88.5283,
                None,
                "VERIFIED",
                now
            ),
            (
                "Crack / Slope Movement",
                "Visible 3-inch fissures noticed on upper slope retaining wall near Laiphampat bypass.",
                24.8170,
                93.9368,
                None,
                "PENDING",
                now
            ),
            (
                "Road Blockage",
                "Fallen boulder and mud slump blocking vehicular movement towards Durtlang hills.",
                23.7271,
                92.7176,
                None,
                "PENDING",
                now
            )
        ]
        cursor.executemany("""
            INSERT INTO reports (hazard_type, description, latitude, longitude, photo_name, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, sample_reports)

    conn.commit()
    conn.close()
    print("Database initialized successfully at", DB_PATH)

if __name__ == "__main__":
    init_db()
