-- Migration: 006_enable_realtime
-- Description: Enable Supabase Realtime on notifications and activity_log tables
--   so the frontend can receive instant updates via websocket subscriptions.

-- 1. Set REPLICA IDENTITY to FULL so Realtime sends complete row data
--    (default is only the primary key, which is not enough for our frontend)
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE activity_log  REPLICA IDENTITY FULL;
ALTER TABLE project_comments REPLICA IDENTITY FULL;

-- 2. Add tables to the supabase_realtime publication
--    This is the publication that Supabase Realtime listens to.
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE project_comments;
