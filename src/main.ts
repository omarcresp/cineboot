import "jsr:@std/dotenv/load";

import { type Context, Hono } from "@hono/hono";
import { HttpStatus } from "@gizmo/http-status";

import "./client.ts";
import playerRepository, { parsePlayer } from "./repositories/players.ts";

const app = new Hono();

app.get("/players", async (c: Context) => {
  const [result, error] = await playerRepository.getPlayers();

  if (error) {
    c.status(HttpStatus.InternalServerError);
    return c.text(error);
  }

  if (!result) {
    c.status(HttpStatus.NotFound);
    return c.text("Not found");
  }

  return c.json(result);
});

app.post("/players", async (c: Context) => {
  const rawPlayer = await c.req.json().catch(() => null);
  const [validationError, player] = parsePlayer(rawPlayer);

  if (validationError) {
    c.status(HttpStatus.BadRequest);

    return c.text(validationError.message);
  }

  const [result, error] = await playerRepository.createPlayer(player);

  if (error) {
    c.status(HttpStatus.InternalServerError);
    return c.text(error);
  }

  return c.json(result);
});

app.get("/health", (c: Context) => {
  return c.text("OK");
});

const PORT = Deno.env.get("PORT") ?? 8000;

Deno.serve({ port: +PORT }, async function (req: Request) {
  const now = performance.now();
  const response = await app.fetch(req);
  console.info(`HONO: ${req.method} ${req.url} took ${performance.now() - now}ms`);

  return response;
});

