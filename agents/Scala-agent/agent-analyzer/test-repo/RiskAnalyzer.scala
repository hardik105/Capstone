object RiskAnalyzer {
  def flagRisks(): Unit = {
    val spark = SparkSession.builder().getOrCreate()
    val df = spark.read.table("silver_emissions")
    
    val windowSpec = Window.partitionBy("region").orderBy(col("co2_output").desc)
    val flagged = df.withColumn("rank", rank().over(windowSpec))
      .filter(col("rank") <= 5)

    flagged.write.format("delta").saveAsTable("gold_delivery_risks")
  }
}