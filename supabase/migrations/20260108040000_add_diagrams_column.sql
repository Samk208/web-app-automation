-- Add diagrams column to business_plans table
-- Stores URLs to generated visual diagrams (flowcharts, roadmaps, charts)

ALTER TABLE business_plans
ADD COLUMN IF NOT EXISTS diagrams JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN business_plans.diagrams IS 'Generated diagram URLs: {serviceFlow, developmentRoadmap, fundingTimeline, orgChart, revenueProjection, budgetBreakdown}';
