from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.workspace import Workspace
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Ensure workspace
    workspace = db.query(Workspace).filter(Workspace.name == data.workspace_name).first()
    if not workspace:
        slug = data.workspace_name.lower().replace(" ", "-")[:40]
        workspace = Workspace(
            name=data.workspace_name,
            slug=slug,
            hindsight_bank_id=f"bank-{slug}"
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role or UserRole.DEVOPS_ENGINEER.value,
        workspace_id=workspace.id,
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={data.email}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
