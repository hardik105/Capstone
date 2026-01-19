INSERT INTO analytics.churn_risk_scores
SELECT user_id, last_login 
FROM silver.web_traffic
WHERE activity_count < 5;