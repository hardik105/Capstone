from orchestrator.graph.graph import app
import json

def test_scala_flow():
    print("🚀 Verifying Scala Connection with Real Spark Code...")
    
    # Simulate a request with Spark lineage evidence
    initial_state = {
        "language": "scala",
        "files": [
            {
                "filename": "SalesProcessor.scala",
                "content": """
                object SalesProcessor {
                  def main(args: Array[String]): Unit = {
                    val df = spark.read.table("production.raw_sales")
                    
                    val processedDf = df.filter("amount > 100")
                    
                    processedDf.write
                      .mode("overwrite")
                      .saveAsTable("analytics.monthly_sales_summary")
                  }
                }
                """
            }
        ]
    }

    print("--- Running LangGraph ---")
    final_state = app.invoke(initial_state)

    print("\n--- Verification Results ---")
    if "lineage" in final_state and final_state["lineage"]:
        print("✅ SUCCESS: Lineage data captured!")
    else:
        print("❌ FAILURE: No data found. Ensure Ollama is running.")

if __name__ == "__main__":
    test_scala_flow()