from orchestrator.graph.state import GraphState

def language_router(state: GraphState) -> GraphState:
    """
    Standardizes language and detects which agent paths to activate.
    The result is stored in state["active_paths"] for the conditional edge to read.
    """
    # 1. Standardize language input
    lang = state.get("language", "unknown").lower()
    state["language"] = lang
    
    # 2. Detect existing file types for automatic routing
    has_scala = any(f["filename"].endswith(".scala") for f in state.get("files", []))
    has_hive = any(f["filename"].endswith((".sql", ".hql")) for f in state.get("files", []))
    # NEW: Detection for PySpark files
    has_pyspark = any(f["filename"].endswith(".py") for f in state.get("files", []))
    
    print(f"\n[Router] 🧭 Language standardized to: {lang}")
    
    # 3. Determine active paths (Parallel Support)
    active_paths = []
    
    # If set to auto/both, we wake up every agent that has relevant files
    if lang == "auto" or lang == "both" or lang == "multi":
        if has_scala: active_paths.append("scala")
        if has_hive: active_paths.append("hivesql")
        if has_pyspark: active_paths.append("pyspark")
    else:
        # Explicit single language path (e.g., user specifically chose 'pyspark')
        active_paths.append(lang)
    
    # 4. Final safety check: if no paths matched but files exist, default to unknown
    if not active_paths and state.get("files"):
        active_paths = ["unknown"]
    
    # Store the list in state so graph.py can access it for conditional branching
    state["active_paths"] = active_paths
    
    print(f"[Router] 🚀 Routing flow to: {state['active_paths']}")
    
    # Return the updated State
    return state