from orchestrator.graph.state import GraphState

def visualization_node(state: GraphState) -> GraphState:
    """
    Consolidates lineage results and prepares them for visualization.
    Ensures all metadata tags (Reads/Writes) are normalized before
    moving to the Summary phase.
    """
    print("\n" + "="*40)
    print("🚀 CONSOLIDATING MULTI-AGENT RESULTS")
    print("="*40)

    # 1. Handle Lineage Graph Data (Nodes/Edges)
    lineage = state.get("lineage", [])
    
    if not lineage:
        print("⚠️  No lineage data found. Check agent logs for extraction errors.")
    else:
        for entry in lineage:
            filename = entry.get('file', 'Unknown')
            # Normalize list access
            r_count = len(entry.get('reads', []))
            w_count = len(entry.get('writes', []))
            print(f"📊 {filename}: {r_count} Reads, {w_count} Writes")

    # 2. SANITIZATION: Fix the missing Read/Write tags issue
    # We explicitly map potential naming variations from different LLM prompts
    raw_details = state.get("fileDetails") or []
    sanitized_details = []

    for item in raw_details:
        sanitized_details.append({
            "filename": item.get("filename"),
            "summary": item.get("summary", "Analysis complete."),
            # Fallback for agents that might use 'inputs' or 'sources'
            "reads": item.get("reads") or item.get("inputs") or item.get("sources") or [],
            "writes": item.get("writes") or item.get("outputs") or item.get("targets") or []
        })

    print(f"✅ Processed {len(sanitized_details)} file analysis records.")
    print("="*40 + "\n")
    
    # Return the updated state with sanitized fileDetails
    return {
        **state,
        "fileDetails": sanitized_details
    }