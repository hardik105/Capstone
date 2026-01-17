object FraudDetector {
  def analyze() = {
    val data = spark.read.table("enriched_transactions")
    val blackList = spark.read.table("global_blacklist")
    
    val alerts = data.join(blackList, "ip_address")
    
    alerts.write.mode("overwrite").saveAsTable("fraud_alerts")
    alerts.groupBy("region").count().write.saveAsTable("fraud_stats_daily")
  }
}