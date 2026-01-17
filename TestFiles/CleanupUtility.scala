object CleanupUtility {
  def archiveOldData(): Unit = {
    val spark = SparkSession.builder().getOrCreate()
    spark.read.table("bronze_logistics")
      .filter(col("date") < "2024-01-01")
      .write.saveAsTable("archived_shipments")
  }
}