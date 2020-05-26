CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  avatar TEXT,
  story VARCHAR(1000),
  wants_help BOOLEAN NOT NULL,
  needs_help BOOLEAN NOT NULL,
  immunocompromised BOOLEAN NOT NULL,
  unemployment BOOLEAN NOT NULL,
  essential BOOLEAN NOT NULL,
  grocery_delivery BOOLEAN NOT NULL,
  walk_dogs BOOLEAN NOT NULL,
  donations BOOLEAN NOT NULL,
  counceling BOOLEAN NOT NULL,
  career_services BOOLEAN NOT NULL
);

CREATE TABLE message_thread (
  id SERIAL PRIMARY KEY,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  unread_messages BOOLEAN NOT NULL DEFAULT TRUE,
  last_msg_timestamp TIMESTAMPTZ NOT NULL
  UNIQUE(created_by, recipient);
);

CREATE TABLE message (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES message_thread(id) ON DELETE CASCADE NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject VARCHAR(150),
  body TEXT NOT NULL,
  time_read TIMESTAMPTZ,
  date_sent TIMESTAMPTZ NOT NULL DEFAULT now()
);
