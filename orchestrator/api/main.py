import uuid
import os
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
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
    files: List[UploadFile] = File(...),
    enhanced: bool = Query(False) # Captures ?enhanced=true/false from frontend
):
    job_id = str(uuid.uuid4())
    print(f"📥 Received {len(files)} files. Enhanced: {enhanced}. Job ID: {job_id}")
    
    jobs[job_id] = {
        "status": "processing",
        "language": language,
        "file_count": len(files),
        "lineage": []
    }
    
    graph_files = []
    for file in files:
        content = await file.read()
        graph_files.append({
            "filename": file.filename,
            "content": content.decode("utf-8")
        })

    background_tasks.add_task(run_graph_analysis, job_id, language, graph_files, enhanced)
    
    return {"status": "submitted", "job_id": job_id}

def run_graph_analysis(job_id: str, language: str, graph_files: list, enhanced: bool):
    try:
        initial_state = {
            "language": language.lower(),
            "files": graph_files,
            "lineage": [],
            "enhanced_mode": enhanced # Pass the toggle to the graph
        }

        result = graph_app.invoke(initial_state)
        
        # Build response payload
        completed_data = {
            "status": "completed",
            "lineage": result.get("lineage", []),
            "sourceFiles": result.get("sourceFiles")
        }

        # Only include AI fields if they were actually generated
        if enhanced:
            completed_data.update({
                "projectSummary": result.get("projectSummary"),
                "fileDetails": result.get("fileDetails"),
                "highlights": result.get("highlights")
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