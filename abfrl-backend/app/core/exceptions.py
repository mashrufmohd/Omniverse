"""
Custom exceptions for the application.
"""

from fastapi import HTTPException


class CustomException(HTTPException):
    """
    Base custom exception.
    """
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(CustomException):
    """
    Exception for not found resources.
    """
    def __init__(self, detail: str = "Not found"):
        super().__init__(status_code=404, detail=detail)


class UnauthorizedException(CustomException):
    """
    Exception for unauthorized access.
    """
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail)