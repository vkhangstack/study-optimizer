-- Initialize the grade management database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to Vietnam
SET timezone = 'Asia/Ho_Chi_Minh';

-- Create a comment for the database
COMMENT ON DATABASE studyoptimizer IS 'Study Optimizer Management Application Database';