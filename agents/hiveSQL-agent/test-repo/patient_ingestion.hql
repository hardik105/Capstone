-- Ingesting daily delta from CRM
INSERT OVERWRITE TABLE bronze_patients
SELECT 
    patient_id, 
    full_name, 
    current_timestamp() as load_date
FROM raw_internal.external_crm_export
WHERE update_flag = 'Y';