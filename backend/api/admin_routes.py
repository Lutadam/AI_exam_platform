from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import List
from db.services import admin_module_service, admin_user_service, admin_role_service
from db.services.admin_user_service import delete_user as delete_user_by_id
from db.services import auth_service


router = APIRouter(prefix="/admin", tags=["Admin"])

# -------------------------------
# MODULE MODELS & ENDPOINTS
# -------------------------------

class ModuleBase(BaseModel):
    ModuleName: str

class ModuleUpdate(ModuleBase):
    ModuleId: int

@router.get("/modules", response_model=List[dict])
def get_modules():
    return  admin_module_service.get_all_modules()

@router.post("/modules")
def create_module(module: ModuleBase):
    try:
        admin_module_service.create_module(module.ModuleName)
        return {"message": "Module created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/modules/{module_id}")
def update_module(module_id: int, module: ModuleBase):
    try:
        admin_module_service.update_module(module_id, module.ModuleName)
        return {"message": "Module updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/modules/{module_id}")
def delete_module(module_id: int):
    try:
        admin_module_service.delete_module(module_id)
        return {"message": "Module deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# USER MODELS & ENDPOINTS
# -------------------------------

class UserBase(BaseModel):
    Username: str
    Password: str
    UserRoleId: int

class UserUpdate(UserBase):
    UserId: int

@router.get("/users", response_model=List[dict])
def get_users():
    return admin_user_service.get_all_users()

@router.post("/users")
def create_user(user: UserBase):
    try:
        admin_user_service.create_user(user.Username, user.Password, user.UserRoleId)
        return {"message": "User created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
def update_user(user_id: int, user: UserBase):
    try:
        admin_user_service.update_user(user_id, user.Username, user.Password, user.UserRoleId)
        return {"message": "User updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/{user_id}/delete")
def delete_user(user_id: int, data: dict = Body(...)):
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    if not auth_service.verify_user_credentials(username, password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    delete_user_by_id(user_id)
    return {"message": "User deleted successfully"}


@router.get("/roles", response_model=List[dict])
def get_roles():
    return admin_role_service.get_all_roles()