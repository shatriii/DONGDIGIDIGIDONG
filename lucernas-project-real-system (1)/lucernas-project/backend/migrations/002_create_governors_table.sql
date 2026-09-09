-- Governors: third real login role (oversight/analytics access — no ticket
-- generation or scanning). Mirrors the existing `organizers` table shape.
CREATE TABLE IF NOT EXISTS governors (
  governorid    SERIAL PRIMARY KEY,
  governormail  VARCHAR(255) UNIQUE NOT NULL,
  passwordhash  TEXT NOT NULL,
  governorname  VARCHAR(255) NOT NULL,
  createdat     TIMESTAMP DEFAULT NOW()
);
