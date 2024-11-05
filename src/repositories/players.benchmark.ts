import "jsr:@std/dotenv/load";

import playerRepository, { parsePlayer } from "./players.ts";

// Sample valid and invalid data for testing
const validPlayer = {
  name: "TestPlayer",
  class: "Warrior",
};

const invalidPlayer = {
  name: 123,
  class: "Warrior",
};

const invalidPlayerWithoutClass = {
  name: "TestPlayer",
};

const invalidPlayerWithExtraField = {
  name: "TestPlayer",
  class: "Warrior",
  extraField: "invalid",
};

// Benchmark function
Deno.bench("parsePlayer with valid data", () => {
  parsePlayer(validPlayer);
});

Deno.bench("parsePlayer with invalid data", () => {
  parsePlayer(invalidPlayer);
});

Deno.bench("parsePlayer without class", () => {
  parsePlayer(invalidPlayerWithoutClass);
});

Deno.bench("parsePlayer with extra field", () => {
  parsePlayer(invalidPlayerWithExtraField);
});

// Benchmark get players
Deno.bench("getPlayers", async () => {
  await playerRepository.getPlayers();
});
