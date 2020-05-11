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
