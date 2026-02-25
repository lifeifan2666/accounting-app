from pydantic import BaseModel
from typing import Optional


class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#5B8DEF"


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagResponse(TagBase):
    id: int

    class Config:
        from_attributes = True
