-- Create psychologists table with avatars
CREATE TABLE public.psychologists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS chat_background TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS selected_psychologist_id UUID REFERENCES public.psychologists(id);

-- Enable RLS
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;

-- Psychologists are viewable by everyone
CREATE POLICY "Psychologists are viewable by everyone"
ON public.psychologists FOR SELECT
USING (true);

-- Insert sample psychologists
INSERT INTO public.psychologists (name, specialty, avatar_url, bio) VALUES
('Dr. Sarah Chen', 'Anxiety & Stress', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', 'Specializing in anxiety disorders and stress management with 15 years of experience.'),
('Dr. Michael Brooks', 'Depression & Mood', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face', 'Expert in mood disorders and cognitive behavioral therapy.'),
('Dr. Emily Watson', 'Relationships', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face', 'Focused on relationship counseling and interpersonal dynamics.'),
('Dr. James Park', 'Trauma & PTSD', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face', 'Specialized in trauma recovery and EMDR therapy.'),
('Dr. Lisa Martinez', 'Self-Esteem', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face', 'Helping clients build confidence and self-worth.');