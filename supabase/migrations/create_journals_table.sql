-- Create journals table for storing user devotional journal entries
-- This table stores journals auto-tagged by pillar (Faith, Hope, Prayer, Love)

CREATE TABLE IF NOT EXISTS public.journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT, -- Links to Real Stuff card ID
    title TEXT NOT NULL,
    content TEXT, -- First reflection content (for backward compatibility)
    pillar TEXT NOT NULL CHECK (pillar IN ('Faith', 'Hope', 'Prayer', 'Love', 'Other')),
    scripture TEXT,
    scripture_ref TEXT,
    reflection TEXT, -- Original card reflection
    reflections JSONB DEFAULT '[]'::jsonb, -- Array of reflection objects [{id, content, date}]
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS journals_user_id_idx ON public.journals(user_id);

-- Create index on pillar for filtering
CREATE INDEX IF NOT EXISTS journals_pillar_idx ON public.journals(pillar);

-- Create index on card_id for checking existing journals
CREATE INDEX IF NOT EXISTS journals_card_id_idx ON public.journals(card_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS journals_updated_at_idx ON public.journals(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own journals
CREATE POLICY "Users can view their own journals"
ON public.journals
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own journals
CREATE POLICY "Users can insert their own journals"
ON public.journals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own journals
CREATE POLICY "Users can update their own journals"
ON public.journals
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own journals
CREATE POLICY "Users can delete their own journals"
ON public.journals
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_journals_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger to call the function on UPDATE
CREATE TRIGGER update_journals_updated_at_trigger
BEFORE UPDATE ON public.journals
FOR EACH ROW
EXECUTE FUNCTION public.update_journals_updated_at();

-- Add comment to table
COMMENT ON TABLE public.journals IS 'Stores user devotional journal entries auto-tagged by pillar';

