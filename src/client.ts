import { Client } from "@dewars/postgres";

const client = new Client({
  database: "cineboot_db",
  user: "cineboot",
  password: "cineboot_password",
  hostname: "localhost",
  port: 5432,
});

await client.connect();

export default client;
