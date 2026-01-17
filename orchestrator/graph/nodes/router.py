from orchestrator.graph.state import GraphState

def language_router(state: GraphState) -> GraphState:
    """
    Standardizes the selected language and returns the full state dictionary.
    The actual routing decision is made by the conditional edge in graph.py
    using the value stored in state["language"].
    """
    # 1. Normalize the language string to lowercase to prevent routing mismatches
    lang = state.get("language", "unknown").lower()
    
    # 2. Update the state to ensure downstream nodes see the standardized string
    state["language"] = lang
    
    print(f"\n[Router] 🧭 Language standardized to: {lang}")
    print(f"[Router] 🚀 Routing flow to corresponding agent...")
    
    # 3. CRITICAL: Nodes MUST return the entire State dictionary (GraphState).
    # Returning a plain string like "scala" will cause the graph to crash.
    return state