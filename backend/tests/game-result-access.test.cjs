const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

test("game results reject non-students before accessing the database", async () => {
  let writes = 0;
  let savedValues;
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../src/controllers/lesson.controller.js"), "utf8"), {
    module, exports: module.exports, console,
    require: (id) => {
      assert.equal(id, "../models/db");
      return { query: async (_query, values) => { writes++; savedValues = values; return { rows: [{ id: 1 }] }; } };
    },
  });
  const body = { games_lessons_id: 7, score: 30, duration: 12 };
  const res = { status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  for (const role of [3, "3", 1, undefined]) {
    await module.exports.saveGameResult({ token: { role, userId: 99 }, body }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(writes, 0);
  }
  await module.exports.saveGameResult({ token: { role: 2, userId: 10 }, body }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(writes, 1);
  assert.deepEqual(Array.from(savedValues), [10, 7, 30, 12]);
});
