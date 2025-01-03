-- Add package_expiration field to profiles table
ALTER TABLE profiles ADD COLUMN package_expiration TIMESTAMP WITH TIME ZONE; 