CREATE TABLE analytics.daily_revenue_summary AS
SELECT p.category, SUM(s.amount) as total_rev
FROM gold.sales_fact s
JOIN gold.product_dim p ON s.pid = p.pid
GROUP BY p.category;