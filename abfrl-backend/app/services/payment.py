"""
Payment service for processing payments.
"""


class PaymentService:
    """
    Service for payment operations.
    """

    @staticmethod
    def process_payment(amount: float) -> bool:
        """
        Mock payment processing.
        """
        # In production, integrate with payment gateway
        return True