object CleanupUtility {
  def repair() = {
    val errors = spark.read.table("ingestion_errors")
    val repaired = errors.filter("repaired = true")
    
    repaired.write.mode("append").saveAsTable("raw_transactions")
    spark.emptyDataFrame.write.mode("overwrite").saveAsTable("ingestion_errors")
  }
}