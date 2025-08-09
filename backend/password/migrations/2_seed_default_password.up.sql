INSERT INTO passwords (value)
SELECT 'ssmapecem'
WHERE NOT EXISTS (SELECT 1 FROM passwords);
