-- 🚨 URGENT FIX: Allow Sending Broadcasts
-- The previous fixes allowed *listening* (SELECT), but we missed *sending* (INSERT).
-- Broadcasting requires INSERT permission on realtime.messages.

BEGIN;

-- 1. Drop existing policies to be safe
DROP POLICY IF EXISTS "Allow broadcast access" ON realtime.messages;
DROP POLICY IF EXISTS "Allow sending broadcasts" ON realtime.messages;

-- 2. Create policy to allow EVERYONE to send broadcasts
CREATE POLICY "Allow sending broadcasts"
ON realtime.messages
FOR INSERT
TO public
WITH CHECK (true);

-- 3. Ensure SELECT is also open (just in case)
DROP POLICY IF EXISTS "Allow realtime access" ON realtime.messages;
CREATE POLICY "Allow receiving broadcasts"
ON realtime.messages
FOR SELECT
TO public
USING (true);

COMMIT;
