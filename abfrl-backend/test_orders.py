from app.db.session import SessionLocal
from app.models.order import Order

db = SessionLocal()
orders = db.query(Order).all()
print(f'Found {len(orders)} orders')
for o in orders[:5]:
    print(f'Order {o.id}: user={o.user_id}, total={o.total_amount}, status={o.status}')
db.close()
