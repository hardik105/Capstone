object CarbonCalculator {
  def calculateEmissions(): Unit = {
    val spark = SparkSession.builder().getOrCreate()
    val shipments = spark.read.table("bronze_logistics")
    val coefficients = spark.read.table("carbon_coefficients")

    val results = shipments.join(coefficients, "transport_type")
      .withColumn("co2_output", col("weight") * col("distance") * col("factor"))
    
    results.write.saveAsTable("silver_emissions")
  }
}