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
    
    print(f"\n[Router] 🧭 Language standardized to: {lang}")
    
    # 3. Determine active paths (Parallel Support)
    active_paths = []
    if lang == "auto" or lang == "both":
        if has_scala: active_paths.append("scala")
        if has_hive: active_paths.append("hivesql")
    else:
        # Single language path
        active_paths.append(lang)
    
    # Store the list in state so graph.py can access it
    state["active_paths"] = active_paths if active_paths else ["unknown"]
    
    print(f"[Router] 🚀 Routing flow to: {state['active_paths']}")
    
    # CRITICAL FIX: Return the dictionary (State), not a list
    return state