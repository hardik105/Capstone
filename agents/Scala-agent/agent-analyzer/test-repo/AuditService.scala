object AuditService {
  def check() = {
    val raw = spark.read.table("raw_transactions")
    val enriched = spark.read.table("enriched_transactions")
    val errors = spark.read.table("ingestion_errors")
    
    // Complex validation logic...
    val report = raw.count() - enriched.count()
    
    spark.createDataFrame(Seq(report)).write.saveAsTable("audit_logs")
  }
}