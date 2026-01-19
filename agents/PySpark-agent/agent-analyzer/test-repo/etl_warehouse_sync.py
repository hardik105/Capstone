from pyspark.sql import SparkSession
import pyspark.sql.functions as F

spark = SparkSession.builder.appName("WarehouseSync").getOrCreate()

# READ 1: External Database
df_remote = spark.read.format("jdbc").options(
    url="jdbc:sqlserver://db.production:1433;databaseName=Sales",
    dbtable="dbo.transactions"
).load()

# READ 2: Hive Table
df_catalog = spark.read.table("inventory.product_catalog")

# Join and Transformation
df_final = df_remote.join(df_catalog, on="product_id", how="inner")

# WRITE: S3 Path
df_final.write.mode("overwrite").parquet("s3://analytics-bucket/gold/sales_report/")