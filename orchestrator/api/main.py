import uuid
import os
import shutil
import tempfile
import git  # Requires: pip install GitPython
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
from orchestrator.graph.graph import app as graph_app

api = FastAPI(title="Multi-Agent Data Lineage System")

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs: Dict[str, dict] = {}

@api.get("/")
async def root():
    return {"status": "online", "message": "Asynchronous Lineage API active"}

@api.post("/analyze/{language}")
async def analyze_files(
    language: str, 
    background_tasks: BackgroundTasks, 
    files: Optional[List[UploadFile]] = File(None), # Made optional
    repo_url: Optional[str] = Query(None),          # New Git URL parameter
    enhanced: bool = Query(False)
):
    job_id = str(uuid.uuid4())
    graph_files = []

    # 1. Handle Git Repository (GitHub/Bitbucket)
    if repo_url:
        print(f"🌐 Fetching Repository: {repo_url}")
        temp_repo_dir = tempfile.mkdtemp() # Create isolated workspace
        try:
            # Shallow clone for efficiency (latest commit only)
            git.Repo.clone_from(repo_url, temp_repo_dir, depth=1)
            
            # Recursively find relevant project files
            for root, _, filenames in os.walk(temp_repo_dir):
                for f in filenames:
                    if f.endswith((".scala", ".sql", ".hql", ".sbt", ".md")):
                        file_path = os.path.join(root, f)
                        # Save relative path to preserve project structure
                        relative_name = os.path.relpath(file_path, temp_repo_dir)
                        with open(file_path, "r", encoding="utf-8") as code_file:
                            graph_files.append({
                                "filename": relative_name,
                                "content": code_file.read()
                            })
        except Exception as clone_error:
            shutil.rmtree(temp_repo_dir)
            raise HTTPException(status_code=400, detail=f"Git Fetch Failed: {str(clone_error)}")
        finally:
            shutil.rmtree(temp_repo_dir) # Clean up temp directory

    # 2. Handle standard manual file/folder uploads
    elif files:
        for file in files:
            content = await file.read()
            graph_files.append({
                "filename": file.filename,
                "content": content.decode("utf-8")
            })

    # Error if no source was provided
    if not graph_files:
        raise HTTPException(status_code=400, detail="No valid project files provided.")

    print(f"📥 Processing {len(graph_files)} files. Enhanced: {enhanced}. Job ID: {job_id}")
    
    jobs[job_id] = {
        "status": "processing",
        "language": language,
        "file_count": len(graph_files),
        "lineage": []
    }

    background_tasks.add_task(run_graph_analysis, job_id, language, graph_files, enhanced)
    
    return {"status": "submitted", "job_id": job_id}

def run_graph_analysis(job_id: str, language: str, graph_files: list, enhanced: bool):
    try:
        initial_state = {
            "language": language.lower(),
            "files": graph_files,
            "lineage": [],
            "enhanced_mode": enhanced 
        }

        result = graph_app.invoke(initial_state)
        
        # Build base response payload
        completed_data = {
            "status": "completed",
            "lineage": result.get("lineage", []),
            "sourceFiles": [f["filename"] for f in result.get("files", [])]
        }

        # CRITICAL FIX: Ensure full content and AI data is passed
        if enhanced:
            completed_data.update({
                "projectSummary": result.get("projectSummary"),
                "fileDetails": result.get("fileDetails"),
                "highlights": result.get("highlights"),
                "sourceFiles": result.get("sourceFiles")
            })

        jobs[job_id].update(completed_data)
        print(f"✅ Job {job_id} completed. Enhanced Analysis: {enhanced}")
        
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        print(f"❌ Job {job_id} failed: {e}")

@api.get("/status/{job_id}")
async def get_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job ID not found")
    return job