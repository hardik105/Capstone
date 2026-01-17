object MarketingAggregator {
  def aggregate() = {
    val users = spark.read.table("user_metadata")
    val events = spark.read.table("mobile_app_events")
    
    val result = events.join(users, "user_id").groupBy("campaign_id").sum("revenue")
    
    result.write.saveAsTable("marketing_roi_report")
  }
}