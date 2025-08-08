CREATE TABLE IF NOT EXISTS passwords (
    id INT PRIMARY KEY DEFAULT 1,
    value TEXT NOT NULL,
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert the default password, but only if the row doesn't already exist.
-- This makes the migration safe to re-run.
INSERT INTO passwords (id, value)
VALUES (1, 'admin')
ON CONFLICT (id) DO NOTHING;
