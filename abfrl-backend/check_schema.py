from sqlalchemy import inspect
from app.db.session import SessionLocal

db = SessionLocal()
inspector = inspect(db.bind)
cols = inspector.get_columns('orders')
print('Orders table columns:')
for c in cols:
    print(f'  {c["name"]}: {c["type"]}')
db.close()
