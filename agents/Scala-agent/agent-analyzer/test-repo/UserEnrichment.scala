object UserEnrichment {
  def run() = {
    val txns = spark.read.table("raw_transactions")
    val users = spark.read.table("user_metadata")
    
    val enriched = txns.join(users, "user_id")
    
    enriched.write.saveAsTable("enriched_transactions")
  }
}