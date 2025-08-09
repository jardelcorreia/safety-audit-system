INSERT INTO areas (name) VALUES
    ('GTP'),
    ('Sinterização'),
    ('Lingotamento'),
    ('Aciaria'),
    ('Pátio'),
    ('Ponte Rolante'),
    ('NR 12'),
    ('Energia'),
    ('Coqueria'),
    ('Alto Forno')
ON CONFLICT (name) DO NOTHING;
