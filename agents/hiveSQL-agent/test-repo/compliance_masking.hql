INSERT OVERWRITE TABLE compliance.research_sandboxed_data
SELECT 
    hash(patient_id) as anon_id,
    regexp_replace(full_name, '.', '*') as masked_name
FROM bronze_patients
WHERE consent_flag = 1;