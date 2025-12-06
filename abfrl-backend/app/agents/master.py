from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from app.agents.llm_client import LLMClient
from app.services.recommendation import RecommendationService
from app.services.inventory import InventoryService
from app.services.payment import PaymentService
from app.services.fulfillment import FulfillmentService
from app.services.cart import CartService
from app.models.product import Product
from app.models.chat import ChatSession, Message
import re

class MasterAgent:
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMClient()
        self.recommendation_service = RecommendationService()
        self.inventory_service = InventoryService()
        self.payment_service = PaymentService()
        self.fulfillment_service = FulfillmentService()
        self.cart_service = CartService()

    def process_message(self, message: str, chat_history: List[Dict] = None, user_id: str = "default_user") -> Dict[str, Any]:
        message_lower = message.lower()
        products = []
        cart_summary = None
        
        # CONVERSATION MANAGEMENT: Clear history / New chat
        if any(keyword in message_lower for keyword in ["clear history", "new chat", "start over", "reset chat"]):
            return self._handle_clear_history(user_id)
        
        # CART MANAGEMENT: Add to cart
        if any(keyword in message_lower for keyword in ["add to cart", "add this", "add that", "i want to buy", "i'll take"]):
            return self._handle_add_to_cart(message, message_lower, chat_history, user_id)
        
        # CART MANAGEMENT: Remove from cart
        elif any(keyword in message_lower for keyword in ["remove from cart", "delete from cart", "remove this", "take out"]):
            return self._handle_remove_from_cart(message, message_lower, chat_history, user_id)
        
        # CART MANAGEMENT: View cart
        elif any(keyword in message_lower for keyword in ["show cart", "view cart", "my cart", "what's in my cart", "cart summary"]):
            return self._handle_view_cart(message, chat_history, user_id)
        
        # CART MANAGEMENT: Apply discount code
        elif any(keyword in message_lower for keyword in ["apply discount", "discount code", "promo code", "coupon"]):
            return self._handle_apply_discount(message, message_lower, chat_history, user_id)
        
        # CART MANAGEMENT: Checkout
        elif any(keyword in message_lower for keyword in ["checkout", "proceed to checkout", "complete order", "finalize purchase"]):
            return self._handle_checkout(message, chat_history, user_id)
        
        # PRODUCT BROWSING: Show products
        elif any(keyword in message_lower for keyword in ["show", "recommend", "jeans", "shirt", "product", "browse", "looking for"]):
            # Get products from database
            if "jeans" in message_lower or "jean" in message_lower:
                db_products = self.db.query(Product).filter(Product.category == "jeans").all()
                category_name = "jeans"
            elif "shirt" in message_lower:
                db_products = self.db.query(Product).filter(Product.category == "shirts").all()
                category_name = "shirts"
            else:
                db_products = self.db.query(Product).limit(5).all()
                category_name = "products"
            
            products = [{
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "imageUrl": p.image_url
            } for p in db_products]
            
            # Use LLM to generate personalized response about the products
            product_info = ", ".join([f"{p['name']} (₹{p['price']})" for p in products])
            prompt = f"The customer asked: '{message}'. I'm showing them {len(products)} {category_name}: {product_info}. Generate a friendly, conversational response introducing these products."
            response = self.llm.generate_response(prompt, chat_history)
            
            return {"response": response, "products": products, "cart_summary": None}
        
        # Check if asking about specific product details
        elif any(keyword in message_lower for keyword in ["detail", "about", "tell me more", "information"]):
            # Try to find product by name mentioned
            words = message_lower.split()
            found_product = None
            
            # Check for product names in the message
            all_products = self.db.query(Product).all()
            for product in all_products:
                product_words = product.name.lower().split()
                if any(word in words for word in product_words):
                    found_product = product
                    break
            
            if found_product:
                products = [{
                    "id": found_product.id,
                    "name": found_product.name,
                    "price": found_product.price,
                    "description": found_product.description,
                    "imageUrl": found_product.image_url
                }]
                
                prompt = f"The customer asked for details about {found_product.name} which costs ₹{found_product.price}. Description: {found_product.description}. Provide detailed information about this product including material, fit, styling tips, and care instructions in a friendly way."
                response = self.llm.generate_response(prompt, chat_history)
                return {"response": response, "products": products, "cart_summary": None}
        
        # Check for cart/purchase related queries  
        elif any(keyword in message_lower for keyword in ["buy", "purchase"]):
            prompt = f"The customer said: '{message}'. They want to add an item to their cart. Respond helpfully, acknowledging their request and asking if they need anything else or want to proceed to checkout."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
            
        elif any(keyword in message_lower for keyword in ["available", "stock", "in store"]):
            prompt = f"Customer asked: '{message}'. Tell them the product is available in stock at Phoenix Mall in sizes S, M, L, XL. Ask if they'd like to reserve it or check another location."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
            
        elif any(keyword in message_lower for keyword in ["order", "pay"]):
            prompt = f"Customer wants to complete their purchase: '{message}'. Guide them through the checkout process in a helpful way."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
            
        elif any(keyword in message_lower for keyword in ["track", "status", "delivery"]):
            prompt = f"Customer asked about order status: '{message}'. Tell them their order is being processed and will arrive in 2-3 business days with tracking info."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
        
        # General conversation - use LLM
        else:
            response = self.llm.generate_response(message, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
    
    def _handle_add_to_cart(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle adding items to cart"""
        # Extract product name or ID from message
        all_products = self.db.query(Product).all()
        found_product = None
        
        # Try to find product by name - Look for exact matches first, then partial
        # Sort products by name length descending to match longest name first
        sorted_products = sorted(all_products, key=lambda p: len(p.name), reverse=True)
        
        for product in sorted_products:
            if product.name.lower() in message_lower:
                found_product = product
                break
        
        # If no exact match, try word matching but be stricter
        if not found_product:
            for product in sorted_products:
                product_words = product.name.lower().split()
                # Check if at least 2 words match for multi-word names, or the single word matches
                matches = sum(1 for word in product_words if word in message_lower)
                if len(product_words) > 1 and matches >= 2:
                    found_product = product
                    break
                elif len(product_words) == 1 and matches == 1:
                    found_product = product
                    break
        
        if not found_product:
            # Try to extract product ID if mentioned
            id_match = re.search(r'product (\d+)|id (\d+)', message_lower)
            if id_match:
                product_id = int(id_match.group(1) or id_match.group(2))
                found_product = self.db.query(Product).filter(Product.id == product_id).first()
        
        if found_product:
            # Extract quantity if mentioned
            quantity = 1
            quantity_match = re.search(r'(\d+)\s*(piece|pieces|item|items)?', message_lower)
            if quantity_match:
                quantity = int(quantity_match.group(1))
            
            # Extract size if mentioned
            size = "M" # Default size
            size_match = re.search(r'size\s*([smlxSMLX]+)', message_lower)
            if size_match:
                size = size_match.group(1).upper()
            
            # Add to cart
            result = self.cart_service.add_item(self.db, user_id, found_product.id, quantity, size)
            
            if result["success"]:
                cart_summary = self.cart_service.get_cart_summary(self.db, user_id)
                prompt = f"Customer added {quantity}x {found_product.name} (₹{found_product.price}) to their cart. Their cart now has {cart_summary['item_count']} items worth ₹{cart_summary['total']}. Confirm the addition and ask if they want to continue shopping or checkout."
                response = self.llm.generate_response(prompt, chat_history)
                
                return {
                    "response": response,
                    "products": [],
                    "cart_summary": cart_summary
                }
            else:
                return {"response": result["message"], "products": [], "cart_summary": None}
        else:
            prompt = f"Customer wants to add something to cart but I couldn't identify the product in: '{message}'. Ask them to specify the product name exactly as shown."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
    
    def _handle_remove_from_cart(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle removing items from cart"""
        # Extract product name or ID
        all_products = self.db.query(Product).all()
        found_product = None
        
        for product in all_products:
            product_words = product.name.lower().split()
            if any(word in message_lower for word in product_words):
                found_product = product
                break
        
        if found_product:
            result = self.cart_service.remove_item(self.db, user_id, found_product.id)
            
            if result["success"]:
                cart_summary = self.cart_service.get_cart_summary(self.db, user_id)
                prompt = f"Customer removed {found_product.name} from their cart. Their cart now has {cart_summary['item_count']} items. Confirm removal and ask if they need anything else."
                response = self.llm.generate_response(prompt, chat_history)
                
                return {
                    "response": response,
                    "products": [],
                    "cart_summary": cart_summary
                }
            else:
                return {"response": result["message"], "products": [], "cart_summary": None}
        else:
            prompt = f"Customer wants to remove something but didn't specify what: '{message}'. Ask which item they want to remove."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
    
    def _handle_view_cart(self, message: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle viewing cart summary"""
        cart_summary = self.cart_service.get_cart_summary(self.db, user_id)
        
        if cart_summary["item_count"] == 0:
            prompt = f"Customer wants to view their cart but it's empty. Encourage them to browse products."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": cart_summary}
        
        # Build detailed cart description
        items_desc = ", ".join([f"{item['quantity']}x {item['product_name']} (₹{item['item_total']})" for item in cart_summary["items"]])
        
        prompt = f"Customer viewing cart. Items: {items_desc}. Subtotal: ₹{cart_summary['subtotal']}, Shipping: ₹{cart_summary['shipping']}, Discount: ₹{cart_summary['discount']}, Total: ₹{cart_summary['total']}. Present this information clearly and ask if they want to apply a discount code or proceed to checkout."
        response = self.llm.generate_response(prompt, chat_history)
        
        return {
            "response": response,
            "products": [],
            "cart_summary": cart_summary
        }
    
    def _handle_apply_discount(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle applying discount codes"""
        # Extract discount code from message
        code_match = re.search(r'code\s+(\w+)|apply\s+(\w+)|use\s+(\w+)|coupon\s+(\w+)', message_lower)
        
        if code_match:
            code = (code_match.group(1) or code_match.group(2) or code_match.group(3) or code_match.group(4)).upper()
            
            # Get cart summary first
            current_cart = self.cart_service.get_cart_summary(self.db, user_id)
            
            if current_cart["item_count"] == 0:
                return {"response": "Your cart is empty. Add some products first!", "products": [], "cart_summary": None}
            
            # Validate discount code
            validation = self.cart_service.validate_discount_code(self.db, code, current_cart["subtotal"])
            
            if validation["valid"]:
                # Apply discount and get updated summary
                cart_summary = self.cart_service.get_cart_summary(self.db, user_id, code)
                
                prompt = f"Customer applied discount code '{code}' successfully! They got {validation['discount_percent']}% off, saving ₹{validation['discount_amount']}. New total: ₹{cart_summary['total']}. Celebrate this discount and ask if they want to checkout."
                response = self.llm.generate_response(prompt, chat_history)
                
                return {
                    "response": response,
                    "products": [],
                    "cart_summary": cart_summary
                }
            else:
                prompt = f"Customer tried discount code '{code}' but it failed: {validation['message']}. Apologize and suggest they try another code or proceed without discount."
                response = self.llm.generate_response(prompt, chat_history)
                return {"response": response, "products": [], "cart_summary": current_cart}
        else:
            # List available discount codes
            prompt = f"Customer wants to use a discount code but didn't specify which one. Tell them about available codes: SAVE10 (10% off ₹1000+), FIRST20 (20% off ₹2000+), MEGA25 (25% off ₹5000+), VIP15 (15% off ₹3000+), WELCOME5 (5% off ₹500+). Ask which one they'd like to apply."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
    
    def _handle_checkout(self, message: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle checkout process"""
        cart_summary = self.cart_service.get_cart_summary(self.db, user_id)
        
        if cart_summary["item_count"] == 0:
            return {"response": "Your cart is empty. Browse our products and add items before checkout!", "products": [], "cart_summary": None}
        
        # Build order summary
        items_desc = ", ".join([f"{item['quantity']}x {item['product_name']}" for item in cart_summary["items"]])
        
        prompt = f"Customer ready to checkout! Order: {items_desc}. Total: ₹{cart_summary['total']} (includes shipping ₹{cart_summary['shipping']}). Guide them through payment: ask for their preferred payment method (Credit Card, UPI, Wallet, or Cash on Delivery). Also mention they can still apply a discount code if they haven't."
        response = self.llm.generate_response(prompt, chat_history)
        
        return {
            "response": response,
            "products": [],
            "cart_summary": cart_summary
        }

    def _handle_clear_history(self, user_id: str) -> Dict[str, Any]:
        """Handle clearing chat history"""
        chat_session = self.db.query(ChatSession).filter(ChatSession.session_id == user_id).first()
        if chat_session:
            self.db.query(Message).filter(Message.session_id == chat_session.id).delete()
            self.db.commit()
            
        return {
            "response": "I've cleared our conversation history. How can I help you today?",
            "products": [],
            "cart_summary": None
        }
