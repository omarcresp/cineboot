CREATE TABLE deno_device (
    id UUID PRIMARY KEY,
    mac VARCHAR(255) NOT NULL,
    firmware VARCHAR(255) NOT NULL
);
