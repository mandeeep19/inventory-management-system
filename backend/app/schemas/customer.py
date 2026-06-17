from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
