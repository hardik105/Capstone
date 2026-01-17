trait ConfigProvider {
  def getConfig: Map[String, String]
}

// Complex feature: Self-type annotation (Dependency Injection)
class AgentStateManager { this: ConfigProvider =>
  
  def updateState(agentId: String)(implicit spark: SparkSession): Unit = {
    val config = getConfig // Accessing method from the mixed-in trait
    
    val stateUpdate = spark.read.table("agent_config_state")
      .filter(s"agent_id = '$agentId'")
    
    // Complex aggregation/transformation
    stateUpdate.groupBy("region")
      .count()
      .write
      .mode("overwrite")
      .saveAsTable("agent_runtime_telemetry")
  }
}