-- Anatolia Spring Supabase Schema Setup
-- Run these SQL commands in your Supabase SQL Editor to initialize the database

-- Create dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NULL REFERENCES dealers(id) ON DELETE SET NULL,
  price_per_bottle DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('water', 'house')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_dealer_id ON sales(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealers_created_at ON dealers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Disable RLS for development (IMPORTANT: Enable proper policies for production!)
ALTER TABLE dealers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- Optional: Add initial sample data (remove if not needed)
-- INSERT INTO dealers (name) VALUES ('Sample Dealer 1'), ('Sample Dealer 2');
