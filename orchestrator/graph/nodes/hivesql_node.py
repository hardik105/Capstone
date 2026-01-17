from orchestrator.graph.state import GraphState

def hivesql_node(state: GraphState) -> GraphState:
    print("[Node] HiveSQL Placeholder - Doing nothing (Return state unchanged)")
    state["lineage"] = [] # Return empty lineage for now
    return state