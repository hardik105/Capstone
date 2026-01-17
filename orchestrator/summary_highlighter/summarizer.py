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
        # Robust extraction for JSON content between the first { and last }
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
    Phase 2 (Optimized): Analyzes ALL code files in a single LLM request.
    This method stays well within Free Tier rate limits (RPM/TPM) by batching data.
    """
    full_code_context = ""
    for entry in lineage:
        # Find the content for the specific file mentioned in lineage data
        f_data = next((f for f in files if f["filename"] == entry["file"]), None)
        if f_data:
            # Number the lines to allow the LLM to identify accurate indices for highlighting
            numbered = "\n".join([f"{i+1}: {l}" for i, l in enumerate(f_data["content"].split('\n'))])
            full_code_context += f"""
---
FILE: {entry['file']}
EXPECTED READS: {entry['reads']}
EXPECTED WRITES: {entry['writes']}
CODE:
{numbered}
"""

    prompt = f"""
    GLOBAL CONTEXT: {project_summary}
    LANGUAGE: {language}

    TASK:
    Analyze the {len(lineage)} files provided below. For EACH file, determine:
    1. A concise 2-sentence summary of its logic.
    2. The EXACT line numbers where 'READ' operations (e.g., spark.read.table) occur for expected tables.
    3. The EXACT line numbers where 'WRITE' operations (e.g., saveAsTable) occur for expected tables.

    CRITICAL: Return ONLY a valid JSON object with a single root key "results".
    Format:
    {{
      "results": {{
        "FileName.scala": {{
          "summary": "...",
          "readLines": [2, 3],
          "writeLines": [9]
        }}
      }}
    }}

    FILES TO ANALYZE:
    {full_code_context}
    """
    
    # Send the batch prompt to Gemini
    raw_response = call_gemini(prompt)
    response_data = clean_json_response(raw_response)
    batch_results = response_data.get("results", {})
    
    # Reformat data for frontend visualization and LangGraph state management
    file_details = []
    highlights = {}
    source_files = {}

    for entry in lineage:
        name = entry["file"]
        file_analysis = batch_results.get(name, {})
        
        # Preserve original source code for the modal viewer component
        orig_file = next((f for f in files if f["filename"] == name), None)
        source_content = orig_file["content"] if orig_file else ""

        file_details.append({
            "filename": name,
            "summary": file_analysis.get("summary", "Summary generation failed."),
            "reads": entry["reads"],
            "writes": entry["writes"]
        })

        highlights[name] = {
            "readLines": file_analysis.get("readLines", []),
            "writeLines": file_analysis.get("writeLines", [])
        }
        
        source_files[name] = source_content

    return {
        "fileDetails": file_details,
        "highlights": highlights,
        "sourceFiles": source_files
    }