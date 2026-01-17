from orchestrator.summary_highlighter.processor import process_summaries

def summary_node(state):
    """
    Agent-agnostic node to generate project-wide and file-specific summaries.
    """
    if state.get("lineage") and state.get("files"):
        enriched_data = process_summaries(
            state["files"], 
            state["lineage"], 
            state["language"]
        )
        
        return {
            "projectSummary": enriched_data.get("projectSummary"),
            "fileDetails": enriched_data.get("fileDetails"),
            "highlights": enriched_data.get("highlights"),
            "sourceFiles": enriched_data.get("sourceFiles")
        }
    
    return state