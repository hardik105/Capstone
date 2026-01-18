WITH daily_avg AS (
    SELECT patient_id, avg(heart_rate) as bpm
    FROM streaming.iot_vitals_stream
    GROUP BY patient_id, window(timestamp, '1 day')
)
INSERT INTO TABLE silver_vitals_daily
SELECT p.patient_id, p.full_name, d.bpm
FROM bronze_patients p
JOIN daily_avg d ON p.patient_id = d.patient_id;