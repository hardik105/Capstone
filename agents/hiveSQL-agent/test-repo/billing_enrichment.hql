CREATE TABLE IF NOT EXISTS gold_patient_billing AS
SELECT 
    v.patient_id,
    pr.provider_name,
    sum(v.bpm * 1.5) as total_charge
FROM silver_vitals_daily v
JOIN masters.provider_ref_table pr ON v.provider_id = pr.id
GROUP BY v.patient_id, pr.provider_name;