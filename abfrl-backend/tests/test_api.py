"""
Basic API tests.
"""

from fastapi.testclient import TestClient

from ..app.main import app

client = TestClient(app)


def test_read_main():
    """
    Test the root endpoint.
    """
    response = client.get("/")
    assert response.status_code == 200


def test_get_products():
    """
    Test getting products.
    """
    response = client.get("/api/v1/products/")
    assert response.status_code == 200