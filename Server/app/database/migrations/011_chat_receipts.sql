ALTER TABLE ride_messages ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS ride_messages_unread_recipient_idx ON ride_messages(ride_id,recipient_id) WHERE is_read IS NOT TRUE;
UPDATE ride_messages m SET recipient_id=CASE WHEN m.sender_id=r.passenger_id THEN dp.user_id
 WHEN m.sender_id=dp.user_id THEN r.passenger_id END
 FROM rides r LEFT JOIN driver_profiles dp ON dp.id=r.driver_id
 WHERE m.ride_id=r.id AND m.recipient_id IS NULL AND m.sender_id IN (r.passenger_id,dp.user_id);
CREATE TABLE IF NOT EXISTS chat_events (
  message_id uuid PRIMARY KEY REFERENCES ride_messages(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  reservation_id uuid,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  broadcast_at timestamptz,
  pushed_at timestamptz
);
CREATE INDEX IF NOT EXISTS chat_events_broadcast_idx ON chat_events(created_at) WHERE broadcast_at IS NULL;
CREATE INDEX IF NOT EXISTS chat_events_push_idx ON chat_events(created_at) WHERE pushed_at IS NULL;
CREATE OR REPLACE FUNCTION assign_ride_chat_recipient() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  SELECT CASE WHEN NEW.sender_id=r.passenger_id THEN dp.user_id
              WHEN NEW.sender_id=dp.user_id THEN r.passenger_id END INTO NEW.recipient_id
    FROM rides r LEFT JOIN driver_profiles dp ON dp.id=r.driver_id WHERE r.id=NEW.ride_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ride_chat_recipient ON ride_messages;
CREATE TRIGGER ride_chat_recipient BEFORE INSERT ON ride_messages FOR EACH ROW EXECUTE FUNCTION assign_ride_chat_recipient();

CREATE OR REPLACE FUNCTION queue_ride_chat_message() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  reservation uuid;
  recipient uuid := NEW.recipient_id;
BEGIN
  IF recipient IS NULL OR recipient=NEW.sender_id THEN RETURN NULL; END IF;
  SELECT request_id INTO reservation FROM rides WHERE id=NEW.ride_id;
  INSERT INTO chat_events(message_id,recipient_id,ride_id,reservation_id)
    VALUES(NEW.id,recipient,NEW.ride_id,reservation);
  INSERT INTO notifications(user_id,type,title,title_fa,body,body_fa,data)
    VALUES(recipient,'ride','پیام جدید سفر','پیام جدید سفر','در گفت‌وگوی سفر پیام تازه دارید.',
           'در گفت‌وگوی سفر پیام تازه دارید.',jsonb_build_object('ride_id',NEW.ride_id,'reservation_id',reservation,'message_id',NEW.id));
  PERFORM pg_notify('taxi2_dispatch_changed','');
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS ride_chat_message_created ON ride_messages;
CREATE TRIGGER ride_chat_message_created AFTER INSERT ON ride_messages FOR EACH ROW EXECUTE FUNCTION queue_ride_chat_message();
