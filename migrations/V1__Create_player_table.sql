CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lvl INTEGER NOT NULL DEFAULT 1,
    class VARCHAR(50) NOT NULL,
    money DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

INSERT INTO player (name, class, lvl, money) VALUES ('Jack', 'Warrior', 1, 100.00);
