from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import (
    UserResponse,
    OperatorCreateRequest,
    OperatorUpdateRequest,
    OperatorPasswordResetRequest,
    OperatorStatusUpdateRequest,
)
from ..auth import hash_password, require_admin

router = APIRouter(prefix="/admin/operators", tags=["operators"])

@router.get("", response_model=List[UserResponse])
def list_operators(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """List all operators and system accounts (Admin Only)."""
    users = db.query(User).order_by(User.id.asc()).all()
    return users

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_operator(
    req: OperatorCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Create a new operator account (Admin Only)."""
    username_clean = req.username.strip()
    
    # 1. Check for duplicate username
    existing = db.query(User).filter(User.username == username_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An operator with username '{username_clean}' already exists."
        )
    
    # 2. Check password match if confirm_password provided
    if req.confirm_password and req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    # 3. Create operator with hashed password
    new_operator = User(
        name=req.name.strip() if req.name else username_clean,
        username=username_clean,
        password_hash=hash_password(req.password),
        role="operator",
        status=req.status or "active",
        station="Bharati Polar Station",
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_operator)
    db.commit()
    db.refresh(new_operator)
    
    return new_operator

@router.get("/{operator_id}", response_model=UserResponse)
def get_operator(
    operator_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Get single operator details (Admin Only)."""
    operator = db.query(User).filter(User.id == operator_id).first()
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found."
        )
    return operator

@router.put("/{operator_id}", response_model=UserResponse)
def update_operator(
    operator_id: int,
    req: OperatorUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Update operator metadata (Admin Only)."""
    operator = db.query(User).filter(User.id == operator_id).first()
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found."
        )
    
    if req.name is not None:
        operator.name = req.name.strip()
    if req.status is not None:
        # Cannot disable default admin account
        if operator.username == "admin" and req.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Default Administrator account cannot be disabled."
            )
        operator.status = req.status
    if req.station is not None:
        operator.station = req.station
        
    operator.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(operator)
    return operator

@router.put("/{operator_id}/password")
def reset_operator_password(
    operator_id: int,
    req: OperatorPasswordResetRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Reset operator password (Admin Only)."""
    operator = db.query(User).filter(User.id == operator_id).first()
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found."
        )
    
    if req.confirm_password and req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    operator.password_hash = hash_password(req.new_password)
    operator.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return {"message": f"Password for operator '{operator.username}' has been successfully reset."}

@router.put("/{operator_id}/status", response_model=UserResponse)
def update_operator_status(
    operator_id: int,
    req: OperatorStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Enable or disable operator account (Admin Only)."""
    operator = db.query(User).filter(User.id == operator_id).first()
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found."
        )
    
    if operator.username == "admin" and req.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Default Administrator account cannot be disabled."
        )
    
    operator.status = req.status
    operator.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(operator)
    return operator

@router.delete("/{operator_id}")
def delete_operator(
    operator_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """Delete an operator account (Admin Only). Cannot delete the default admin."""
    operator = db.query(User).filter(User.id == operator_id).first()
    if not operator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Operator not found."
        )
    
    if operator.username == "admin" or operator.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The Primary Administrator account cannot be deleted."
        )
    
    username = operator.username
    db.delete(operator)
    db.commit()
    
    return {"message": f"Operator '{username}' was successfully deleted."}
