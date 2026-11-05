const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const vm = require("node:vm");
const test = require("node:test");
const { PGlite } = require(path.join(os.tmpdir(), "lugati-sql-validation/node_modules/@electric-sql/pglite"));

test("six active activities complete the letter; deleted lessons do not affect unlocking", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE TABLE letters (id integer PRIMARY KEY, symbol text, name text, order_index integer, is_deleted integer DEFAULT 0);
      CREATE TABLE letter_lessons (id integer PRIMARY KEY, is_deleted integer DEFAULT 0);
      CREATE TABLE user_progress (id serial PRIMARY KEY, user_id integer, letter_id integer, lesson_id integer, lesson_type text, score integer, completed boolean, updated_at timestamp, UNIQUE(user_id,letter_id,lesson_id));
      INSERT INTO letters (id,symbol,name,order_index) VALUES (1,'أ','ألف',1),(2,'ب','باء',2),(3,'ت','تاء',3);
      INSERT INTO letters VALUES (4,'ث','ثاء',4,1);
      INSERT INTO letter_lessons (id) VALUES (1),(2),(3),(4),(5),(12);
      INSERT INTO letter_lessons VALUES (99,1);
    `);
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../src/controllers/progress.controller.js"), "utf8"), {
      module, exports: module.exports, console,
      require: (id) => { assert.equal(id, "../models/db"); return db; },
    });
    const res = { status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    const status = async () => {
      await module.exports.getUserLettersStatus({ token: { userId: 10 } }, res);
      assert.equal(res.statusCode, 200);
      return Array.from(res.body.letters, (letter) => letter.status);
    };
    assert.deepEqual(await status(), ["unlocked", "locked", "locked"]);
    for (const [index, lesson] of [1, 2, 12, 3, 4, 5].entries()) {
      await module.exports.upsertUserProgress({ token: { userId: 10 }, body: { letter_id: 1, lesson_id: lesson, lesson_type: "test", score: 1, completed: true } }, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(await status(), index === 5 ? ["completed", "unlocked", "locked"] : ["unlocked", "locked", "locked"]);
    }
    await module.exports.checkLetterCompletion({ token: { userId: 10 }, params: { letterId: 1 } }, res);
    assert.equal(res.body.isCompleted, true);
    assert.equal(res.body.nextLetter.symbol, "ب");
    assert.equal((await db.query("SELECT count(*)::integer AS total FROM user_progress")).rows[0].total, 6);
  } finally { await db.close(); }
});
