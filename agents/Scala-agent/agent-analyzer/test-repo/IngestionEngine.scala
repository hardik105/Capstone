object IngestionEngine {
  def process() = {
    val logs = spark.read.table("web_logs")
    val mobile = spark.read.table("mobile_app_events")
    
    val unified = logs.union(mobile)
    
    unified.write.mode("append").saveAsTable("raw_transactions")
    unified.filter("status = 'error'").write.saveAsTable("ingestion_errors")
  }
}