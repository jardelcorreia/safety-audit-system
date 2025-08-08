INSERT INTO passwords (value)
SELECT 'admin'
WHERE NOT EXISTS (SELECT 1 FROM passwords);
