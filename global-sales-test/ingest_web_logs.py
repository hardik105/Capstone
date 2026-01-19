from pyspark.sql import SparkSession
spark = SparkSession.builder.appName("LogIngestion").getOrCreate()
# READ: Raw S3 Logs
raw_df = spark.read.json("s3://raw-zone/logs/2026/*")
# WRITE: Silver Delta Table
raw_df.write.format("delta").saveAsTable("silver.web_traffic")