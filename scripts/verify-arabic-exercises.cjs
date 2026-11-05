// Local, in-memory PostgreSQL tests only. This script never reads .env or DB_URL.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { PGlite } = require(process.env.PGLITE_MODULE || path.join(os.tmpdir(), 'lugati-sql-validation/node_modules/@electric-sql/pglite'));
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'docs/database');
const schema = fs.readFileSync(path.join(dir, 'project.schema.sql'), 'utf8');
const sql = fs.readFileSync(path.join(dir, 'seed-missing-arabic-exercises.sql'), 'utf8');
const seed = JSON.parse(fs.readFileSync(path.join(dir, 'arabic-exercises.seed.json'), 'utf8'));
const reference = JSON.parse(fs.readFileSync(path.join(dir, 'learning-content-reference.json'), 'utf8'));

async function fixture({ missingLesson = false, missingLetter = false } = {}) {
  const db = new PGlite();
  await db.exec(schema);
  for (const letter of reference.letters.filter(l => !missingLetter || l.symbol !== seed.at(-1).symbol)) {
    await db.query('INSERT INTO letters (id,symbol,name,order_index,is_deleted) VALUES ($1,$2,$3,$4,$5)', [letter.id,letter.symbol,letter.name,letter.order_index,letter.is_deleted]);
  }
  for (const lesson of reference.lessons.filter(l => !missingLesson || l.id !== 12)) {
    await db.query('INSERT INTO letter_lessons (id,type,title,order_index,is_lastlesson,is_deleted) VALUES ($1,$2,$3,$4,$5,$6)', [lesson.id,lesson.type,lesson.title,lesson.order_index,lesson.is_lastlesson,lesson.is_deleted]);
  }
  return db;
}
const snapshot = async db => Object.fromEntries(await Promise.all(['questions_lessons','games_lessons','game_configs'].map(async table => [table,(await db.query(`SELECT * FROM ${table} ORDER BY id`)).rows])));
async function assertPreserved(db, before) {
  const after = await snapshot(db);
  for (const [table, rows] of Object.entries(before)) {
    const ids = new Set(rows.map(row => row.id));
    assert.deepEqual(after[table].filter(row => ids.has(row.id)), rows, `${table}: existing records changed`);
  }
}
async function assertComplete(db) {
  const questions = (await db.query('SELECT letter_id,lesson_id,count(*)::integer AS count FROM questions_lessons WHERE is_deleted=0 GROUP BY letter_id,lesson_id')).rows;
  assert.equal(questions.length, 56);
  assert(questions.every(row => row.count === 4));
  assert.equal((await db.query('SELECT count(*)::integer AS count FROM games_lessons')).rows[0].count, 112);
  assert.equal((await db.query('SELECT count(*)::integer AS count FROM game_configs')).rows[0].count, 112);
}
async function addQuestion(db, letterId, exercise, question) {
  await db.query('INSERT INTO questions_lessons (letter_id,lesson_id,question_text,correct_answer,question_type,is_deleted) VALUES ($1,$2,$3,$4,$5,0)', [letterId,exercise.lesson_id,JSON.stringify({...question.text,legacy_marker:true}),question.answer,exercise.question_type]);
}

(async () => {
  let db = await fixture();
  try {
    await db.exec(sql);
    await assertComplete(db);
    const once = await snapshot(db);
    await db.exec(sql);
    assert.deepEqual(await snapshot(db), once);
    console.log('PASS: empty content -> 224 questions, 112 games, 112 configs; rerun adds nothing.');
  } finally { await db.close(); }

  db = await fixture();
  try {
    for (let i = 0; i < 3; i++) {
      const letterId = reference.letters.find(l => l.symbol === seed[i].symbol).id;
      for (const exercise of seed[i].exercises) for (const question of exercise.questions) await addQuestion(db,letterId,exercise,question);
      for (const game of seed[i].games) {
        await db.query('INSERT INTO games_lessons (letter_id,lesson_id,game_type,order_index,is_deleted) VALUES ($1,5,$2,99,0)', [letterId,game.game_type]);
        await db.query('INSERT INTO game_configs (letter_id,lesson_id,game_type,data) VALUES ($1,5,$2,$3::jsonb)', [letterId,game.game_type,JSON.stringify({...game.data,legacy_marker:true})]);
      }
    }
    const before = await snapshot(db);
    await db.exec(sql);
    await assertComplete(db);
    await assertPreserved(db,before);
    const after = await snapshot(db);
    assert.equal(after.questions_lessons.length - before.questions_lessons.length, 200);
    assert.equal(after.games_lessons.length - before.games_lessons.length, 100);
    assert.equal(after.game_configs.length - before.game_configs.length, 100);
    await db.exec(sql);
    assert.deepEqual(await snapshot(db),after);
    console.log('PASS: first 3 letters preserved exactly; added 200 questions, 100 games, 100 configs for remaining letters; idempotent.');
  } finally { await db.close(); }

  db = await fixture();
  try {
    const [harakat,position] = seed[0].exercises;
    await addQuestion(db,1,harakat,harakat.questions[0]);
    await addQuestion(db,1,position,position.questions[0]);
    await addQuestion(db,1,position,position.questions[3]);
    const before = await snapshot(db);
    await db.exec(sql);
    await assertComplete(db);
    await assertPreserved(db,before);
    assert.equal((await db.query("SELECT count(DISTINCT correct_answer)::integer AS count FROM questions_lessons WHERE letter_id=1 AND lesson_id=3")).rows[0].count,4);
    assert.equal((await db.query("SELECT count(DISTINCT correct_answer)::integer AS count FROM questions_lessons WHERE letter_id=1 AND lesson_id=12")).rows[0].count,3);
    console.log('PASS: partial question groups filled to four with missing answer categories first.');
  } finally { await db.close(); }

  db = await fixture();
  try {
    await db.exec("INSERT INTO games_lessons (letter_id,lesson_id,game_type,is_deleted) VALUES (1,5,'word_catch',1),(2,4,'word_catch',0)");
    const before = await snapshot(db);
    await db.exec(sql);
    await assertPreserved(db,before);
    assert.equal((await db.query("SELECT count(*)::integer AS count FROM game_configs WHERE letter_id IN (1,2) AND game_type='word_catch'")).rows[0].count,0);
    console.log('PASS: deleted or differently linked existing games are not changed or reactivated.');
  } finally { await db.close(); }

  for (const options of [{missingLesson:true},{missingLetter:true}]) {
    db = await fixture(options);
    try {
      await assert.rejects(db.exec(sql));
      await db.exec('ROLLBACK');
      const after = await snapshot(db);
      assert(Object.values(after).every(rows => rows.length === 0));
    } finally { await db.close(); }
  }
  console.log('PASS: missing required lessons/letters abort without adding content. Neon was not written.');
})().catch(error => { console.error(error); process.exitCode = 1; });
