import org.apache.spark.sql.SparkSession

object IngestionEngine {
  def process(): Unit = {
    val spark = SparkSession.builder().getOrCreate()
    // Extracting global logistics data
    val rawData = spark.read.table("raw_shipments")
    val partnerData = spark.read.json("s3://partner-logs/daily_v1.json")
    
    val unified = rawData.union(partnerData)
    unified.write.mode("append").saveAsTable("bronze_logistics")
  }
}