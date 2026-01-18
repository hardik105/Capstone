from langgraph.graph import StateGraph, END
from orchestrator.graph.state import GraphState

# Import Nodes
from orchestrator.graph.nodes.router import language_router
from orchestrator.graph.nodes.scala_node import scala_node
from orchestrator.graph.nodes.hivesql_node import hivesql_node
from orchestrator.graph.nodes.pyspark_node import pyspark_node
from orchestrator.graph.nodes.visualization_node import visualization_node
from orchestrator.graph.nodes.summary_node import summary_node

# Router logic: Decide whether to run AI summary or finish
def routing_after_viz(state: GraphState):
    if state.get("enhanced_mode") is True:
        return "summarizer"
    return END

# Initialize the Graph
workflow = StateGraph(GraphState)

# Add Nodes
workflow.add_node("router", language_router)
workflow.add_node("scala_agent", scala_node)
workflow.add_node("hivesql_agent", hivesql_node)
workflow.add_node("pyspark_agent", pyspark_node)
workflow.add_node("visualizer", visualization_node)
workflow.add_node("summarizer", summary_node)

# Set Entry Point
workflow.set_entry_point("router")

# Define Multi-Path Routing
# The lambda extracts the list of paths stored by the router node
workflow.add_conditional_edges(
    "router",
    lambda state: state.get("active_paths", ["unknown"]), 
    {
        "scala": "scala_agent",
        "hivesql": "hivesql_agent",
        "pyspark": "pyspark_agent",
        "unknown": "visualizer"
    }
)

# Fan-in: All paths converge at visualizer
# Parallel agents will finish before this node begins
workflow.add_edge("scala_agent", "visualizer")
workflow.add_edge("hivesql_agent", "visualizer")
workflow.add_edge("pyspark_agent", "visualizer")

# AFTER visualization, check if enhanced mode is on
workflow.add_conditional_edges(
    "visualizer",
    routing_after_viz,
    {
        "summarizer": "summarizer",
        END: END
    }
)

workflow.add_edge("summarizer", END)

app = workflow.compile()