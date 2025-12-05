from sqlalchemy.orm import Session
from app.agents.llm_client import LLMClient
from app.services.recommendation import RecommendationService
from app.services.inventory import InventoryService
from app.services.payment import PaymentService
from app.services.fulfillment import FulfillmentService

class MasterAgent:
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMClient()
        self.recommendation_service = RecommendationService()
        self.inventory_service = InventoryService()
        self.payment_service = PaymentService()
        self.fulfillment_service = FulfillmentService()

    def process_message(self, message: str) -> str:
        message_lower = message.lower()
        if "show" in message_lower or "recommend" in message_lower or "jeans" in message_lower or "shirt" in message_lower:
            recommendations = self.recommendation_service.get_recommendations(message)
            return f"Here are some recommendations: {recommendations}. Would you like to add to cart?"
        elif "available" in message_lower or "stock" in message_lower or "in store" in message_lower:
            # Mock check for product 1
            available = self.inventory_service.check_stock(self.db, 1, 1)
            if available:
                return "Yes, it's available in stock. Would you like to place an order?"
            else:
                return "Sorry, out of stock. Try another size."
        elif "order" in message_lower or "checkout" in message_lower or "pay" in message_lower:
            success = self.payment_service.process_payment(100.0)  # Mock amount
            if success:
                return "Payment successful! Your order is placed. Tracking will be available soon."
            else:
                return "Payment failed. Please try again."
        elif "track" in message_lower or "status" in message_lower:
            return "Your order is shipped and will arrive in 2 days."
        else:
            # Fallback to LLM
            prompt = f"You are a helpful retail assistant. Respond to: {message}"
            return self.llm.generate_response(prompt)