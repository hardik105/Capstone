# READ: JDBC Source
customers = spark.read.format("jdbc").option("dbtable", "salesforce.leads").load()
# WRITE: Hive Table
customers.write.mode("overwrite").saveAsTable("gold.customer_master")