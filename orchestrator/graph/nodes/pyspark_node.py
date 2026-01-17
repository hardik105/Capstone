from orchestrator.graph.state import GraphState

def pyspark_node(state: GraphState) -> GraphState:
    """
    BLACK BOX: PySpark Agent (Logic not implemented yet).
    """
    print("[Node] Reached PySpark Node - Pass-through mode.")
    # Ensure lineage key exists to avoid graph crashes
    if "lineage" not in state:
        state["lineage"] = []
    return state