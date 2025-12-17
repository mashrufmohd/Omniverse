"""
Shopkeeper authentication and management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
import firebase_admin
from firebase_admin import auth as firebase_auth

from app.models.user import User as UserModel
from app.models.product import Product as ProductModel

router = APIRouter()
security = HTTPBearer()


@router.post("/register")
async def register_shopkeeper(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Verify shopkeeper registration (Firebase handles all auth).
    No MongoDB storage - Firebase is the single source of truth.
    """
    try:
        print("\n" + "="*60)
        print("🏪 SHOPKEEPER REGISTRATION REQUEST")
        print("="*60)
        
        token = credentials.credentials
        print("📝 Verifying Firebase token...")
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', email.split('@')[0])
        
        print(f"✅ Token verified successfully!")
        print(f"   UID: {uid}")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print("\n📌 NOTE: User credentials stored in Firebase only")
        print("   MongoDB not used for user authentication")
        print("="*60 + "\n")
        
        return {
            "message": "Shopkeeper verified successfully",
            "uid": uid,
            "email": email,
            "name": name,
            "role": "shopkeeper"
        }
        
    except Exception as e:
        print("❌ SHOPKEEPER REGISTRATION FAILED")
        print(f"Error: {str(e)}")
        print("="*60 + "\n")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify shopkeeper: {str(e)}"
        )


async def get_current_shopkeeper(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Verify Firebase token and return shopkeeper info.
    No MongoDB lookup - Firebase is the source of truth.
    """
    try:
        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', email.split('@')[0])
        
        # Return Firebase user info directly (no MongoDB)
        return {
            "uid": uid,
            "email": email,
            "name": name,
            "role": "shopkeeper"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me")
async def get_shopkeeper_info(
    current_shopkeeper = Depends(get_current_shopkeeper)
):
    """Get current shopkeeper information from Firebase token."""
    return current_shopkeeper


@router.patch("/me")
async def update_shopkeeper_profile(
    profile_data: dict,
    current_shopkeeper = Depends(get_current_shopkeeper)
):
    """
    Update shopkeeper profile (store in Firebase custom claims or separate collection).
    For now, returns success - implement custom storage if needed.
    """
    return {
        "message": "Profile update not implemented - Firebase handles user data",
        "note": "Use Firebase Admin SDK custom claims for additional shopkeeper data"
    }


@router.get("/products")
async def get_shopkeeper_products(
    current_shopkeeper = Depends(get_current_shopkeeper)
):
    """Get all products listed by this shopkeeper (using Firebase UID)."""
    
    products = await ProductModel.find(
        ProductModel.shopkeeper_id == current_shopkeeper["uid"]
    ).to_list()
    
    return [
        {
            "id": str(product.id),
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "category": product.category,
            "image_url": product.image_url,
            "stock": product.stock,
            "is_verified": product.is_verified
        }
        for product in products
    ]


@router.post("/products")
async def create_product(
    product_data: dict,
    current_shopkeeper = Depends(get_current_shopkeeper)
):
    """Create a new product listing (using Firebase UID)."""
    
    product = ProductModel(
        name=product_data.get('name'),
        description=product_data.get('description'),
        price=float(product_data.get('price', 0)),
        category=product_data.get('category', 'General'),
        image_url=product_data.get('image_url'),
        stock=int(product_data.get('stock', 0)),
        shopkeeper_id=current_shopkeeper["uid"],
        shopkeeper_name=current_shopkeeper.get("name", ""),
        is_verified=False  # Requires admin approval
    )
    
    await product.insert()
    
    return {
        "message": "Product created successfully",
        "product": {
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "shopkeeper_name": product.shopkeeper_name
        }
    }


@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product_data: dict,
    current_shopkeeper: UserModel = Depends(get_current_shopkeeper)
):
    """Update a product listing."""
    
    product = await ProductModel.get(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify product belongs to this shopkeeper
    if product.shopkeeper_id != current_shopkeeper.firebase_uid:
        raise HTTPException(status_code=403, detail="Not authorized to edit this product")
    
    # Update allowed fields
    allowed_fields = ['name', 'description', 'price', 'category', 'image_url', 'stock']
    for field in allowed_fields:
        if field in product_data:
            setattr(product, field, product_data[field])
    
    await product.save()
    
    return {
        "message": "Product updated successfully",
        "product": {
            "id": product.id,
            "name": product.name,
            "price": float(product.price)
        }
    }


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    current_shopkeeper: UserModel = Depends(get_current_shopkeeper)
):
    """Delete a product listing."""
    
    product = await ProductModel.get(product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify product belongs to this shopkeeper
    if product.shopkeeper_id != current_shopkeeper.firebase_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    await product.delete()
    
    return {"message": "Product deleted successfully"}


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_shopkeeper: UserModel = Depends(get_current_shopkeeper)
):
    """Get shopkeeper dashboard statistics."""
    
    # Count products
    total_products = await ProductModel.find(
        ProductModel.shopkeeper_id == current_shopkeeper.firebase_uid
    ).count()
    
    verified_products = await ProductModel.find(
        ProductModel.shopkeeper_id == current_shopkeeper.firebase_uid,
        ProductModel.is_verified == True
    ).count()
    
    pending_products = total_products - verified_products
    
    return {
        "total_products": total_products,
        "verified_products": verified_products,
        "pending_products": pending_products,
        "shop_name": current_shopkeeper.shop_name or "Not set"
    }
