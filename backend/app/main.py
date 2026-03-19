import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel

# Load .env from the parent directory (../.env)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = FastAPI(title="PrimeTrade Backend Task")

origins = [
    "http://localhost:5173",    # Default Vite port
    "http://127.0.0.1:5173",
]

# --- CORS SETUP (Crucial for React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # For dev, allow all. In production, specify your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase environment variables in .env")

supabase: Client = create_client(supabase_url, supabase_key)

# --- SCHEMAS (Input Validation) ---
class TaskCreate(BaseModel):
    title: str
    description: str = None

# --- DEPENDENCIES ---

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    token = authorization.replace("Bearer ", "")
    try:
        # We use 'get_user' to verify the JWT session with Supabase
        res = supabase.auth.get_user(token)
        return res.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def admin_required(user = Depends(get_current_user)):
    response = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
    if not response.data or response.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# --- ROUTES ---

@app.get("/")
def root():
    return {"message": "API is running. Visit /docs for Swagger."}

@app.get("/tasks")
async def get_tasks(user = Depends(get_current_user)): 
    try:
        # We add .eq("user_id", user.id) to filter the results
        response = supabase.table("tasks").select("*").eq("user_id", user.id).execute()
        
        if not response.data:
            print(f"DEBUG: No tasks found for user {user.id}")
            return []
            
        print(f"DEBUG: Fetched {len(response.data)} tasks for user {user.id}")
        return response.data

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return [{"id": "err", "title": "Error", "description": "Could not fetch your tasks."}]

@app.post("/tasks")
async def create_task(task: TaskCreate, user = Depends(get_current_user)):
    data = {
        "title": task.title, 
        "description": task.description, 
        "user_id": str(user.id)
    }
    result = supabase.table("tasks").insert(data).execute()
    return result.data

@app.delete("/admin/tasks/{task_id}")
async def delete_any_task(task_id: int, _ = Depends(admin_required)):
    result = supabase.table("tasks").delete().eq("id", task_id).execute()
    return {"message": "Deleted successfully", "data": result.data}