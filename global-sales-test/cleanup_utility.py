# READ: Temporary Staging
df = spark.read.parquet("/tmp/staging/daily_batch")
# WRITE: Archive Path
df.write.mode("append").parquet("s3://archive-zone/backups/daily_batch")