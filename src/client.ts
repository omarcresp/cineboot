import { Client } from "@dewars/postgres";

const client = new Client({
  port: Deno.env.get("PGPORT"),
  hostname: Deno.env.get("PGHOST"),
  user: Deno.env.get("PGUSER"),
  password: Deno.env.get("PGPASSWORD"),
  database: Deno.env.get("PGDATABASE"),
});

await client.connect();

export default client;
