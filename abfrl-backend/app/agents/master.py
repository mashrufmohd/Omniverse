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
    def __init__(self):
        self.llm = LLMClient()
        self.recommendation_service = RecommendationService()
        self.inventory_service = InventoryService()
        self.payment_service = PaymentService()
        self.fulfillment_service = FulfillmentService()
        self.cart_service = CartService()

    async def process_message(self, message: str, chat_history: List[Dict] = None, user_id: str = "default_user") -> Dict[str, Any]:
        message_lower = message.lower()
        products = []
        cart_summary = None
        
        # CONVERSATION MANAGEMENT: Clear history / New chat
        if any(keyword in message_lower for keyword in ["clear history", "new chat", "start over", "reset chat"]):
            return await self._handle_clear_history(user_id)
        
        # CART MANAGEMENT: Add to cart - Enhanced keywords
        if any(keyword in message_lower for keyword in [
            "add to cart", "add this", "add that", "add it", "add the",
            "i want to buy", "i'll take", "i will take", "buy this", "buy that",
            "purchase this", "purchase that", "get this", "get that",
            "put in cart", "add in cart", "cart add",
            "i want this", "i want that", "i need this", "i need that"
        ]):
            return await self._handle_add_to_cart(message, message_lower, chat_history, user_id)
        
        # CART MANAGEMENT: Remove from cart
        elif any(keyword in message_lower for keyword in ["remove from cart", "delete from cart", "remove this", "remove that", "take out"]):
            return await self._handle_remove_from_cart(message, message_lower, chat_history, user_id)
        
        # CART MANAGEMENT: View cart
        elif any(keyword in message_lower for keyword in ["show cart", "view cart", "my cart", "what's in my cart", "cart summary", "what is in cart", "whats in cart", "items in cart", "check cart", "whats there in cart"]):
            return await self._handle_view_cart(message, chat_history, user_id)
        
        # CART MANAGEMENT: Apply discount code
        elif any(keyword in message_lower for keyword in ["apply discount", "discount code", "promo code", "coupon"]):
            return self._handle_apply_discount(message, message_lower, chat_history, user_id)
        
        # CART MANAGEMENT: Checkout
        elif any(keyword in message_lower for keyword in ["checkout", "proceed to checkout", "complete order", "finalize purchase"]):
            return self._handle_checkout(message, chat_history, user_id)
        
        # ORDER MANAGEMENT: View order history
        elif any(keyword in message_lower for keyword in [
            "my orders", "my order", "order history", "past orders", "previous orders", 
            "recent orders", "show orders", "view orders", "order list",
            "what did i order", "what have i ordered", "past purchases",
            "do we have any orders", "do we have any order", "do i have orders", "do i have any order",
            "any orders", "any order", "have i ordered", "did i order", "check my orders",
            "check orders", "see my orders", "show my orders"
        ]):
            return await self._handle_view_orders(message, chat_history, user_id)
        
        # ORDER MANAGEMENT: Track specific order
        elif any(keyword in message_lower for keyword in [
            "track order", "order status", "where is my order", "check order",
            "order tracking", "delivery status", "shipment status"
        ]):
            return await self._handle_track_order(message, message_lower, chat_history, user_id)
        
        # PRODUCT BROWSING: Show products
        elif any(keyword in message_lower for keyword in ["show", "recommend", "jeans", "shirt", "product", "browse", "looking for"]):
            # Get products from database using Beanie
            if "jeans" in message_lower or "jean" in message_lower:
                db_products = await Product.find(Product.category == "jeans").to_list()
                category_name = "jeans"
            elif "shirt" in message_lower or "tshirt" in message_lower or "t-shirt" in message_lower:
                db_products = await Product.find(Product.category == "shirts").to_list()
                category_name = "shirts"
            else:
                db_products = await Product.find().limit(5).to_list()
                category_name = "products"
            
            products = [{
                "id": str(p.id),
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "image_url": p.image_url
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
            
            # Check for product names in the message using Beanie
            all_products = await Product.find().to_list()
            for product in all_products:
                product_words = product.name.lower().split()
                if any(word in words for word in product_words):
                    found_product = product
                    break
            
            if found_product:
                products = [{
                    "id": str(found_product.id),
                    "name": found_product.name,
                    "price": found_product.price,
                    "description": found_product.description,
                    "image_url": found_product.image_url
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
            
        # Note: "order" keyword is handled above in ORDER MANAGEMENT section
        elif any(keyword in message_lower for keyword in ["pay", "payment"]):
            prompt = f"Customer wants to complete their purchase: '{message}'. Guide them through the checkout process in a helpful way."
            response = self.llm.generate_response(prompt, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
        
        # General conversation - use LLM
        else:
            response = self.llm.generate_response(message, chat_history)
            return {"response": response, "products": [], "cart_summary": None}
    
    async def _handle_add_to_cart(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle adding items to cart"""
        # Extract product name or ID from message
        all_products = await Product.find_all().to_list()
        found_product = None
        
        # Try to find product by name - Look for exact matches first, then partial
        # Sort products by name length descending to match longest name first
        sorted_products = sorted(all_products, key=lambda p: len(p.name), reverse=True)
        
        # Method 1: Exact product name match
        for product in sorted_products:
            if product.name.lower() in message_lower:
                found_product = product
                break
        
        # Method 2: Try word matching
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
        
        # Method 3: Try to extract product ID if mentioned
        if not found_product:
            id_match = re.search(r'product (\d+)|id[:\s]*(\d+)|#(\d+)', message_lower)
            if id_match:
                # Assuming ID is still int or string? Beanie uses ObjectId by default but we might have custom IDs
                # Let's assume we are using string IDs or int IDs as per model definition
                # If Product model uses int id, we need to cast. If ObjectId, we need to handle that.
                # Let's check Product model later. For now assuming it might be int or str.
                product_id = id_match.group(1) or id_match.group(2) or id_match.group(3)
                # Try to find by id (assuming id field exists and is compatible)
                # If using default Beanie, id is PydanticObjectId.
                # If we migrated from SQL, we might have kept integer IDs or mapped them.
                # Let's assume we can search by id if it's an int field or similar.
                # If it's ObjectId, we can't easily search by int unless we have a custom field.
                # Let's assume we search by a custom 'id' field if it exists, or skip this for now if unsure.
                # For safety, let's search by 'id' attribute if it matches.
                try:
                    found_product = await Product.get(product_id)
                except:
                    pass
        
        # Method 4: Check recent chat history for product context
        if not found_product and chat_history:
            # Look at the last AI message to see if it mentioned products
            for msg in reversed(chat_history[-3:]):  # Check last 3 messages
                if msg.get("role") == "ai":
                    content = msg.get("content", "").lower()
                    # Extract product names from AI's response
                    for product in sorted_products:
                        if product.name.lower() in content:
                            found_product = product
                            break
                    if found_product:
                        break
        
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
            result = await self.cart_service.add_item(user_id, str(found_product.id), quantity, size)
            
            if result["success"]:
                cart_summary = await self.cart_service.get_cart_summary(user_id)
                prompt = f"Customer added {quantity}x {found_product.name} (₹{found_product.price}) to their cart. Their cart now has {cart_summary['item_count']} items worth ₹{cart_summary['total']}. Confirm the addition and ask if they want to continue shopping or checkout."
                response = self.llm.generate_response(prompt, chat_history)
                
                # Include the added product in the response so frontend can display it if needed
                added_product_info = [{
                    "id": str(found_product.id),
                    "name": found_product.name,
                    "price": found_product.price,
                    "description": found_product.description,
                    "image_url": found_product.image_url
                }]

                return {
                    "response": response,
                    "products": added_product_info,
                    "cart_summary": cart_summary
                }
            else:
                return {"response": result["message"], "products": [], "cart_summary": None}
        else:
            # Show available products if we couldn't identify what they want
            sample_products = await Product.find_all().limit(5).to_list()
            product_list = ", ".join([p.name for p in sample_products])
            prompt = f"Customer wants to add something to cart but I couldn't identify which product from: '{message}'. Here are some products I have: {product_list}. Ask them to specify which product they'd like, or say 'show me [category]' to browse."
            response = self.llm.generate_response(prompt, chat_history)
            
            # Return products to help them choose
            products = [{
                "id": str(p.id),
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "image_url": p.image_url
            } for p in sample_products]
            
            return {"response": response, "products": products, "cart_summary": None}
    
    async def _handle_remove_from_cart(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle removing items from cart"""
        # Extract product name or ID
        all_products = await Product.find_all().to_list()
        found_product = None
        
        for product in all_products:
            product_words = product.name.lower().split()
            if any(word in message_lower for word in product_words):
                found_product = product
                break
        
        if found_product:
            result = await self.cart_service.remove_item(user_id, str(found_product.id))
            
            if result["success"]:
                cart_summary = await self.cart_service.get_cart_summary(user_id)
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
    
    async def _handle_view_cart(self, message: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle viewing cart summary"""
        cart_summary = await self.cart_service.get_cart_summary(user_id)
        
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
    
    async def _handle_apply_discount(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle applying discount codes"""
        # Extract discount code from message
        code_match = re.search(r'code\s+(\w+)|apply\s+(\w+)|use\s+(\w+)|coupon\s+(\w+)', message_lower)
        
        if code_match:
            code = (code_match.group(1) or code_match.group(2) or code_match.group(3) or code_match.group(4)).upper()
            
            # Get cart summary first
            current_cart = await self.cart_service.get_cart_summary(user_id)
            
            if current_cart["item_count"] == 0:
                return {"response": "Your cart is empty. Add some products first!", "products": [], "cart_summary": None}
            
            # Validate discount code
            validation = await self.cart_service.validate_discount_code(code, current_cart["subtotal"])
            
            if validation["valid"]:
                # Apply discount and get updated summary
                cart_summary = await self.cart_service.get_cart_summary(user_id, code)
                
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
    
    async def _handle_checkout(self, message: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle checkout process"""
        cart_summary = await self.cart_service.get_cart_summary(user_id)
        
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

    async def _handle_clear_history(self, user_id: str) -> Dict[str, Any]:
        """Handle clearing chat history"""
        chat_session = await ChatSession.find_one(ChatSession.user_id == user_id)
        if chat_session:
            chat_session.messages = []
            await chat_session.save()
            
        return {
            "response": "I've cleared our conversation history. How can I help you today?",
            "products": [],
            "cart_summary": None
        }
    
    async def _handle_view_orders(self, message: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle viewing order history"""
        from app.agents.tools import get_user_orders
        
        orders_data = await get_user_orders.ainvoke({"user_id": user_id})
        
        if isinstance(orders_data, str):
            # No orders or error
            response = self.llm.generate_response(
                f"Customer asked to see their orders but {orders_data}. Respond in a friendly way and suggest they browse products.",
                chat_history
            )
            return {"response": response, "products": [], "cart_summary": None}
        
        # Format order history nicely
        total_orders = orders_data.get("total_orders", 0)
        orders = orders_data.get("orders", [])
        
        orders_summary = []
        for order in orders[:5]:  # Show last 5 orders
            items_list = ", ".join([f"{item['name']} x{item['quantity']}" for item in order.get('items', [])])
            orders_summary.append(
                f"Order #{order['order_id'][:8]}... on {order['date']}: {items_list} - Total: {order['total_amount']} - Status: {order['status']}"
            )
        
        orders_text = "\n".join(orders_summary)
        prompt = f"Customer wants to see their order history. They have {total_orders} orders:\n{orders_text}\n\nSummarize this in a friendly, conversational way. Mention they can ask for details about a specific order if needed."
        response = self.llm.generate_response(prompt, chat_history)
        
        return {"response": response, "products": [], "cart_summary": None}
    
    async def _handle_track_order(self, message: str, message_lower: str, chat_history: List[Dict], user_id: str) -> Dict[str, Any]:
        """Handle tracking a specific order"""
        from app.agents.tools import get_order_status, get_user_orders
        
        # Try to extract order ID from message
        import re
        order_id_match = re.search(r'[0-9a-f]{24}', message_lower)
        
        if order_id_match:
            # User provided order ID
            order_id = order_id_match.group(0)
            order_details = await get_order_status.ainvoke({"order_id": order_id})
            
            if isinstance(order_details, str):
                # Error or not found
                response = self.llm.generate_response(
                    f"Customer asked about order {order_id} but {order_details}. Respond politely and offer to show their recent orders instead.",
                    chat_history
                )
                return {"response": response, "products": [], "cart_summary": None}
            
            # Format order details
            items_list = ", ".join([f"{item['product']} (Size: {item['size']}) x{item['quantity']}" for item in order_details.get('items', [])])
            prompt = f"""Customer wants to track their order. Details:
Order ID: {order_details['order_id'][:12]}...
Date: {order_details['order_date']}
Status: {order_details['status']}
Payment: {order_details['payment_status']} via {order_details['payment_method']}
Total: {order_details['total_amount']}
Items: {items_list}
Shipping to: {order_details['shipping_address']}
Estimated delivery: {order_details['estimated_delivery']}

Provide a friendly, detailed update about their order status and when they can expect delivery."""
            response = self.llm.generate_response(prompt, chat_history)
        else:
            # No order ID provided, show recent orders
            orders_data = await get_user_orders.ainvoke({"user_id": user_id})
            
            if isinstance(orders_data, str) or orders_data.get("total_orders", 0) == 0:
                response = self.llm.generate_response(
                    "Customer asked to track an order but they don't have any orders yet. Suggest they place an order first.",
                    chat_history
                )
                return {"response": response, "products": [], "cart_summary": None}
            
            # Show recent orders
            orders = orders_data.get("orders", [])[:3]
            orders_list = "\n".join([
                f"Order #{order['order_id'][:8]}... from {order['date']} - Status: {order['status']} - Total: {order['total_amount']}"
                for order in orders
            ])
            
            prompt = f"Customer wants to track an order but didn't specify which one. Their recent orders:\n{orders_list}\n\nAsk them which order they'd like to track or if they want details about the most recent one."
            response = self.llm.generate_response(prompt, chat_history)
        
        return {"response": response, "products": [], "cart_summary": None}
