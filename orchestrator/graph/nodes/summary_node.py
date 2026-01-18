from orchestrator.summary_highlighter.processor import process_summaries

def summary_node(state):
    """
    Agent-agnostic node to generate project-wide and file-specific summaries.
    Returns only the updated fields to finalize the GraphState.
    """
    # 1. Safety check to ensure we have data to summarize
    if not state.get("lineage") or not state.get("files"):
        print("⚠️ Summary skipped: Missing lineage or file data.")
        return {
            "projectSummary": "Summary could not be generated.",
            "fileDetails": [],
            "highlights": {},
            "sourceFiles": {}
        }

    try:
        print(f"📊 Summarizing {len(state['lineage'])} file(s) across {state['language']} context...")
        
        # 2. Invoke the LLM Processor
        enriched_data = process_summaries(
            state["files"], 
            state["lineage"], 
            state["language"]
        )
        
        # 3. Return ONLY the new fields. LangGraph merges these into the State.
        return {
            "projectSummary": enriched_data.get("projectSummary", "Analysis complete."),
            "fileDetails": enriched_data.get("fileDetails", []),
            "highlights": enriched_data.get("highlights", {}),
            "sourceFiles": enriched_data.get("sourceFiles", {})
        }

    except Exception as e:
        print(f"❌ Summary Node Error: {e}")
        # Fallback to prevent the graph from hanging
        return {
            "projectSummary": "Analysis encountered an error during summary generation.",
            "fileDetails": [],
            "highlights": {},
            "sourceFiles": {}
        }