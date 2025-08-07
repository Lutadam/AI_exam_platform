from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth_routes import router as auth_router
from api.lecturer_routes import router as lecturer_router
from api.admin_routes import router as admin_router
from api.student_routes import router as student_router
from api.student_exam_routes import router as student_exam_router
from api.student_result_routes import router as student_result_router

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Make sure to include your routers here
app.include_router(auth_router)
app.include_router(lecturer_router)
app.include_router(admin_router)
app.include_router(student_router)
app.include_router(student_exam_router)
app.include_router(student_result_router)