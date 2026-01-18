INSERT INTO TABLE emergency_alerts
SELECT patient_id, bpm, alert_rank
FROM (
    SELECT 
        patient_id, 
        bpm, 
        RANK() OVER (PARTITION BY region ORDER BY bpm DESC) as alert_rank
    FROM silver_vitals_daily
) ranked_vitals
WHERE alert_rank <= 10;