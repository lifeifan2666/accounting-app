from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[TagResponse])
def get_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的所有标签"""
    return db.query(Tag).filter(Tag.user_id == current_user.id).all()


@router.post("/", response_model=TagResponse)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建标签"""
    # 检查标签名是否已存在（只检查当前用户的标签）
    existing = db.query(Tag).filter(
        Tag.name == tag.name,
        Tag.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="标签名已存在")

    db_tag = Tag(**tag.model_dump(), user_id=current_user.id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    tag: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新标签"""
    db_tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    update_data = tag.model_dump(exclude_unset=True)

    # 如果更新名称，检查是否重复
    if "name" in update_data:
        existing = db.query(Tag).filter(
            Tag.name == update_data["name"],
            Tag.id != tag_id,
            Tag.user_id == current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="标签名已存在")

    for key, value in update_data.items():
        setattr(db_tag, key, value)

    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除标签"""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    db.delete(tag)
    db.commit()
    return {"message": "标签已删除"}
