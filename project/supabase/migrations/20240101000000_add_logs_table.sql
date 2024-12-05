-- Create logs table
CREATE TABLE IF NOT EXISTS public.logs (
    id BIGSERIAL PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on timestamp for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.logs(timestamp);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);

-- Create index on level for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs(level);

-- Enable Row Level Security
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to view logs
CREATE POLICY "Enable read access for admins only" ON public.logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Create policy to allow system to insert logs
CREATE POLICY "Enable insert access for system" ON public.logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create function to clean old logs
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete logs older than 30 days
    DELETE FROM public.logs
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to clean old logs
SELECT cron.schedule(
    'clean-old-logs',  -- name of the cron job
    '0 0 * * *',      -- run at midnight every day
    'SELECT clean_old_logs();'
);
