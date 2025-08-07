from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from db.services import user_service

router = APIRouter()

@router.post("/login")
async def login_user(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JSONResponse(status_code=400, content={"error": "Missing username or password"})

    user = user_service.authenticate_user(username, password)
    return {"userId": user["UserId"], "username": user["Username"], "role": user["userRole"]}

