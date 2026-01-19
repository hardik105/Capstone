# Mixing SQL and API
raw_logs = spark.sql("SELECT * FROM raw_data.system_logs WHERE log_date = current_date()")
lookup = spark.read.csv("/mnt/configs/app_lookup.csv", header=True)

final_logs = raw_logs.join(lookup, "app_id")

# Multi-format Write
final_logs.write.insertInto("warehouse.aggregated_logs")
final_logs.write.json("/archive/logs/daily_backup/")