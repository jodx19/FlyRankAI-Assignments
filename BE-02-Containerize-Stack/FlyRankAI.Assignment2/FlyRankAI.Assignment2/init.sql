CREATE TABLE IF NOT EXISTS intern_profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    track VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL
);

INSERT INTO intern_profile (name, track, status) 
VALUES ('Mahmoud Mostafa', 'Backend AI Engineering', 'Active')
ON CONFLICT DO NOTHING;