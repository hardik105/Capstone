# Variables used for paths
INPUT_SOURCE = "clinical.patient_vitals"
OUTPUT_TARGET = "risk_scores.high_risk_patients"

vitals = spark.table(INPUT_SOURCE)
history = spark.read.parquet("s3://lakehouse/bronze/medical_history")

# Logic to calculate risk
scored_df = vitals.join(history, "patient_id").filter(F.col("bp") > 140)

# Writing to a Hive table using variable
scored_df.write.saveAsTable(OUTPUT_TARGET)
