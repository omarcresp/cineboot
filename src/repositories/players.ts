import { ulid } from "@std/ulid";
import { safeQueryObject } from "../utils/safeQueryObject.ts";
import { HttpStatus } from "@gizmo/http-status";
import * as ss from "@superstruct/core";

export interface Player {
  id: number;
  name: string;
  lvl: number;
  class: string;
  money: number;
}

export type PlayerDTO = Omit<Player, "id" | "lvl" | "money">;

const playerRepository = {
  getPlayers: async (): Promise<[Player[], null] | [null, string]> => {
    const [result, error] = await safeQueryObject<Player>(
      "SELECT * FROM players",
    );

    if (error || !result) {
      console.trace(error || "No result error");

      return [null, error];
    }

    return [result.rows, null];
  },

  createPlayer: async (
    player: PlayerDTO,
  ): Promise<[Player, null] | [null, string]> => {
    const [result, error] = await safeQueryObject<Player>(
      "INSERT INTO players (name, class, id) VALUES ($1, $2, $3) RETURNING *",
      [player.name, player.class, ulid()],
    );

    if (error || !result) {
      console.trace(error || "No result error");

      return [null, error];
    }

    return [result.rows[0], null];
  },
};

class HttpError<T = unknown> extends Error {
  constructor(message: string, public status: number, override cause?: T) {
    super(message);
    this.name = this.constructor.name;
  }
}

function unprocessableEntity<T = unknown>(
  message: string,
  cause?: T,
): HttpError<T> {
  return new HttpError(message, HttpStatus.UnprocessableEntity, cause);
}

export function parsePlayer(
  player: unknown,
): [HttpError<ss.StructError>, undefined] | [undefined, PlayerDTO] {
  const playerDTO = ss.object({
    name: ss.string(),
    class: ss.string(),
  });

  const [error, result] = playerDTO.validate(player);

  if (error) {
    return [
      unprocessableEntity("Validation error " + error.message, error),
      undefined,
    ];
  }

  return [undefined, result];
}

export default playerRepository;
