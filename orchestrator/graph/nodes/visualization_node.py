from orchestrator.graph.state import GraphState

def visualization_node(state: GraphState) -> GraphState:
    """
    Consolidates lineage results and prepares them for visualization.
    This node serves as the final checkpoint before the optional AI 
    Summary & Highlighter phase.
    """
    print("\n" + "="*40)
    print("🚀 DATA LINEAGE SUMMARY")
    print("="*40)

    # Lineage data is populated by the Scala/PySpark/Hive agents
    lineage = state.get("lineage", [])
    
    if not lineage:
        print("⚠️  No lineage data found. Check agent logs for extraction errors.")
    else:
        # Log the extracted connections to the terminal for debugging
        for entry in lineage:
            filename = entry.get('file', 'Unknown')
            reads = entry.get('reads', [])
            writes = entry.get('writes', [])
            
            print(f"📄 File: {filename}")
            print(f"   📥 Reads:  {', '.join(reads) or '(none)'}")
            print(f"   📤 Writes: {', '.join(writes) or '(none)'}")
    
    print("="*40 + "\n")
    
    # We return the state as-is. 
    # The 'lineage' key here is what index.html uses to draw the D3 nodes/edges.
    return state