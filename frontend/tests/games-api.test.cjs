const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const { transformSync } = require("@swc/core");
const { AxiosError } = require("axios");

// Load the TypeScript API modules without introducing a second test toolchain.
require.extensions[".ts"] = (module, filename) => {
  const { code } = transformSync(fs.readFileSync(filename, "utf8"), {
    filename,
    jsc: { parser: { syntax: "typescript" }, target: "es2022" },
    module: { type: "commonjs" },
  });
  module._compile(code, filename);
};

global.localStorage = { getItem: () => null };
const api = require("../src/API/axios.ts").default;
const { getLetterGameTypes, getLetterGameProgress, completeGamesLesson } = require("../src/API/games.ts");
const { saveGameResult } = require("../src/API/gameResult.ts");
const response = (config, data) => ({ config, data, status: 200, statusText: "OK", headers: {} });

test("games API", async (suite) => {
  await suite.test("saves the final game's result before checking and completing letter progress", async () => {
    const requests = [];
    let releaseSave;
    api.defaults.adapter = async (config) => {
      requests.push(config.url);
      if (config.url === "/lessons/saveGameResult") {
        assert.deepEqual(JSON.parse(config.data), { games_lessons_id: 8, score: 30, duration: 12 });
        await new Promise((resolve) => { releaseSave = resolve; });
        return response(config, { data: { id: 99 } });
      }
      if (config.url === "/lessons/7/games/progress") return response(config, { totalGames: 4, playedGamesCount: 4 });
      assert.equal(config.url, "/progress/upsertProgress");
      assert.deepEqual(JSON.parse(config.data), { letter_id: 7, lesson_id: 5, lesson_type: "game", score: 1, completed: true });
      return response(config, { success: true });
    };
    const pending = saveGameResult({ letter_id: 7, games_lessons_id: 8, score: 30, duration: 12 });
    await new Promise(setImmediate);
    assert.deepEqual(requests, ["/lessons/saveGameResult"]);
    releaseSave();
    assert.deepEqual(await pending, { id: 99 });
    assert.deepEqual(requests, ["/lessons/saveGameResult", "/lessons/7/games/progress", "/progress/upsertProgress"]);
  });

  await suite.test("does not complete the lesson for missing or unfinished games", async () => {
    for (const progress of [{ totalGames: 0, playedGamesCount: 0 }, { totalGames: 4, playedGamesCount: 3 }]) {
      const requests = [];
      api.defaults.adapter = async (config) => {
        requests.push(config.url);
        if (config.url === "/lessons/saveGameResult") return response(config, { data: { id: 99 } });
        assert.equal(config.url, "/lessons/7/games/progress");
        return response(config, progress);
      };
      await saveGameResult({ letter_id: 7, games_lessons_id: 8, score: 30, duration: 12 });
      assert.equal(requests.length, 2);
    }
  });

  await suite.test("does not check completion when saving the game fails", async () => {
    api.defaults.adapter = async (config) => {
      assert.equal(config.url, "/lessons/saveGameResult");
      throw new Error("Save failed");
    };
    await assert.rejects(saveGameResult({ letter_id: 7, games_lessons_id: 8, score: 30, duration: 12 }), /Save failed/);
  });

  await suite.test("returns supported games and forwards cancellation", async () => {
    const controller = new AbortController();
    api.defaults.adapter = async (config) => {
      assert.equal(config.url, "/lessons/game-lesson/7/letter-id");
      assert.equal(config.signal, controller.signal);
      return response(config, { data: [ { game_type: "sorting" }, { game_type: "future_game" }, { game_type: "memory_match" } ] });
    };
    assert.deepEqual(await getLetterGameTypes(7, controller.signal), ["sorting", "memory_match"]);
  });

  await suite.test("accepts an empty games response", async () => {
    api.defaults.adapter = async (config) => response(config, { data: null });
    assert.deepEqual(await getLetterGameTypes(7, new AbortController().signal), []);
  });

  await suite.test("treats 404 as no configured games", async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Not found", "ERR_BAD_REQUEST", config, null, { ...response(config, {}), status: 404 });
    };
    assert.deepEqual(await getLetterGameTypes(7, new AbortController().signal), []);
  });

  await suite.test("preserves network failures instead of treating them as 404", async () => {
    const failure = new AxiosError("Offline", "ERR_NETWORK");
    api.defaults.adapter = async () => { throw failure; };
    await assert.rejects(getLetterGameTypes(7, new AbortController().signal), (error) => error === failure);
  });

  await suite.test("does not send an already canceled request", async () => {
    const controller = new AbortController();
    controller.abort();
    api.defaults.adapter = async () => { assert.fail("Canceled request reached adapter"); };
    await assert.rejects(getLetterGameTypes(7, controller.signal), { code: "ERR_CANCELED" });
  });

  await suite.test("reads progress for the selected letter", async () => {
    api.defaults.adapter = async (config) => {
      assert.equal(config.url, "/lessons/7/games/progress");
      return response(config, { totalGames: 4, playedGamesCount: 3 });
    };
    assert.deepEqual(await getLetterGameProgress(7, new AbortController().signal), { totalGames: 4, playedGamesCount: 3 });
  });

  await suite.test("saves completion using the shared lesson and selected letter", async () => {
    const controller = new AbortController();
    api.defaults.adapter = async (config) => {
      assert.equal(config.method, "post");
      assert.equal(config.url, "/progress/upsertProgress");
      assert.equal(config.signal, controller.signal);
      assert.deepEqual(JSON.parse(config.data), { letter_id: 9, lesson_id: 5, lesson_type: "game", score: 1, completed: true });
      return response(config, { success: true });
    };
    assert.deepEqual(await completeGamesLesson(9, controller.signal), { success: true });
  });
});
