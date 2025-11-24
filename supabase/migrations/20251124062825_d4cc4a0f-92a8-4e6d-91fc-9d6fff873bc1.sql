-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create notification for video likes
CREATE OR REPLACE FUNCTION public.notify_video_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_owner_id UUID;
BEGIN
  -- Get the video owner
  SELECT user_id INTO video_owner_id
  FROM public.videos
  WHERE id = NEW.video_id;

  -- Don't notify if user liked their own video
  IF video_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, video_id)
    VALUES (video_owner_id, 'like', NEW.user_id, NEW.video_id);
  END IF;

  RETURN NEW;
END;
$$;

-- Function to create notification for comments
CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_owner_id UUID;
BEGIN
  -- Get the video owner
  SELECT user_id INTO video_owner_id
  FROM public.videos
  WHERE id = NEW.video_id;

  -- Don't notify if user commented on their own video
  IF video_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, video_id, comment_id)
    VALUES (video_owner_id, 'comment', NEW.user_id, NEW.video_id, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Function to create notification for follows
CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id);
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_video_like_notify
  AFTER INSERT ON public.video_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_video_like();

CREATE TRIGGER on_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment();

CREATE TRIGGER on_follow_notify
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_follow();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;