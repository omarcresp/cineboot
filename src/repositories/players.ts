import { ulid } from "@std/ulid";
import { safeQueryObject } from "../utils/safeQueryObject.ts";

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
      "SELECT * FROM playerss",
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

export function parsePlayer(
  player: unknown,
): [PlayerDTO, null] | [null, string] {
  if (!player) {
    return [null, "Validation error: player is required"];
  }

  if (typeof player !== "object") {
    return [
      null,
      "Validation error: player must be an object with name and class properties",
    ];
  }

  if (!("name" in player)) {
    return [null, "Validation error: player must have a name property"];
  }

  if (typeof player.name !== "string") {
    return [null, "Validation error: player name must be a string"];
  }

  if (!("class" in player)) {
    return [null, "Validation error: player must have a class property"];
  }

  if (typeof player.class !== "string") {
    return [null, "Validation error: player class must be a string"];
  }

  const playerDTO: PlayerDTO = {
    name: player.name,
    class: player.class,
  };

  return [playerDTO, null];
}

export default playerRepository;
