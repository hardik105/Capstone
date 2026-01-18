import json
import re
from .llm_client import call_gemini

def clean_json_response(raw_text):
    """
    Extracts JSON from LLM response in case it includes preambles or markdown blocks.
    """
    if isinstance(raw_text, dict):
        return raw_text
    try:
        match = re.search(r'(\{.*\})', str(raw_text), re.DOTALL)
        if match:
            return json.loads(match.group(1))
        return json.loads(str(raw_text))
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return {}

def get_project_summary(all_files, lineage_data, language, project_context):
    """
    Phase 1: Generates a professional high-level summary of the entire project context.
    Uses the 1.5/2.5 Pro models' high-reasoning capabilities.
    """
    prompt = f"""
    You are a Senior Data Architect analyzing a {language} project.
    
    PROJECT MAP:
    {project_context}
    
    TASK:
    Provide a professional 3-sentence summary of this project. 
    Focus on the end-to-end data flow and the overall purpose of the pipeline.
    
    CRITICAL: Return ONLY valid JSON in this format:
    {{
      "projectSummary": "..."
    }}
    """
    
    raw_response = call_gemini(prompt)
    response_data = clean_json_response(raw_response)
    return response_data.get("projectSummary", f"Data lineage project for {language}.")

def get_all_file_details_one_shot(files, lineage, project_summary, language):
    """
    Phase 2 (Optimized): Analyzes ALL uploaded files in a single LLM request.
    Iterates over 'files' instead of 'lineage' to include README and build.sbt.
    """
    full_code_context = ""
    
    # NEW: Iterate over every file in the upload, not just lineage-detected files
    for f_data in files:
        name = f_data["filename"]
        # Find lineage entry if it exists for this file
        entry = next((item for item in lineage if item["file"] == name), 
                     {"file": name, "reads": [], "writes": []})
        
        # Number lines for precise highlighting logic
        numbered = "\n".join([f"{i+1}: {l}" for i, l in enumerate(f_data["content"].split('\n'))])
        full_code_context += f"""
---
FILE: {name}
EXPECTED READS: {entry.get('reads', [])}
EXPECTED WRITES: {entry.get('writes', [])}
CODE:
{numbered}
"""

    prompt = f"""
    GLOBAL CONTEXT: {project_summary}
    LANGUAGE: {language}

    TASK:
    Analyze the {len(files)} files provided below. For EACH file:
    1. Provide a concise 2-sentence summary of its role in the project.
    2. For configuration files (like build.sbt) or documentation (README.md), explain what they manage or document.
    3. Identify EXACT line numbers for 'READ' and 'WRITE' operations for code files based on the 'EXPECTED' hints.

    CRITICAL: Return ONLY a valid JSON object with a single root key "results".
    Format:
    {{
      "results": {{
        "filename": {{
          "summary": "...",
          "readLines": [2, 3],
          "writeLines": [9]
        }}
      }}
    }}

    FILES TO ANALYZE:
    {full_code_context}
    """
    
    raw_response = call_gemini(prompt)
    response_data = clean_json_response(raw_response)
    batch_results = response_data.get("results", {})
    
    file_details = []
    highlights = {}
    source_files = {}

    # Final Loop: Process all files for the frontend dashboard
    for f_data in files:
        name = f_data["filename"]
        file_analysis = batch_results.get(name, {})
        
        # Match back with original lineage data for READ/WRITE tags
        entry = next((item for item in lineage if item["file"] == name), 
                     {"file": name, "reads": [], "writes": []})

        file_details.append({
            "filename": name,
            "summary": file_analysis.get("summary", "Summary generation failed."),
            "reads": entry.get("reads", []),
            "writes": entry.get("writes", [])
        })

        highlights[name] = {
            "readLines": file_analysis.get("readLines", []),
            "writeLines": file_analysis.get("writeLines", [])
        }
        
        # This fixes the "Source code not available" error
        source_files[name] = f_data["content"]

    return {
        "fileDetails": file_details,
        "highlights": highlights,
        "sourceFiles": source_files
    }