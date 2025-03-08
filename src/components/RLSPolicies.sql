
-- This file contains SQL statements that need to be executed in the Supabase SQL Editor
-- to fix the Row Level Security policies for the achievements table

-- First, drop any existing policies on the achievements table that might be causing issues
DROP POLICY IF EXISTS "Users can manage their own achievements" ON achievements;
DROP POLICY IF EXISTS "Teachers can manage student achievements" ON achievements;

-- Create policy for users to manage their own achievements
CREATE POLICY "Users can manage their own achievements" 
ON achievements 
FOR ALL
USING (auth.uid() = user_id);

-- Create policy allowing teachers to manage student achievements
CREATE POLICY "Teachers can manage student achievements" 
ON achievements 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Make sure we have RLS enabled on the achievements table
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
