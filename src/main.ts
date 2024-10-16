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
  const [player, validationError] = parsePlayer(rawPlayer);

  if (validationError || !player) {
    c.status(HttpStatus.BadRequest);

    return c.text(validationError);
  }

  const [result, error] = await playerRepository.createPlayer(player);

  if (error || !result) {
    c.status(HttpStatus.InternalServerError);
    return c.text(error);
  }

  return c.json(result);
});

Deno.serve({ port: 8000 }, app.fetch);
