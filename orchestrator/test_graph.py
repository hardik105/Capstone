from orchestrator.graph.graph import app
from orchestrator.graph.state import GraphState

state = GraphState(
    language="scala",
    files=[{"filename": "Test.scala", "content": "object Test {}"}]
)

result = app.invoke(state)
print("\nGraph output:")
print(result)
