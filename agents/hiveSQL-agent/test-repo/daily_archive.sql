-- Archiving old patient records
INSERT INTO TABLE warehouse.glacier_archive_patients
SELECT * FROM bronze_patients
WHERE load_date < add_months(current_date, -12);