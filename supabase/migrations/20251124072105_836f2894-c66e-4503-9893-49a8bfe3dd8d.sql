-- Add is_verified column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Update Loomi account to be verified (assuming username is 'Loomi')
UPDATE public.profiles SET is_verified = true WHERE username = 'Loomi';