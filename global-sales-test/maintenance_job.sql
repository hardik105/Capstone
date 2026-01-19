TRUNCATE TABLE staging.temp_processing;
INSERT INTO staging.temp_processing SELECT * FROM gold.active_orders;