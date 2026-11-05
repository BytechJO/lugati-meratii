// Reads curriculum configuration only, never learner or account records.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { Client } = require(path.join(root, 'backend/node_modules/pg'));
const env = require(path.join(root, 'backend/node_modules/dotenv')).parse(fs.readFileSync(path.join(root, 'backend/.env')));
(async () => {
  const client = new Client({ connectionString: env.DB_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000, statement_timeout: 20000 });
  try {
    await client.connect();
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const read = async text => (await client.query(text)).rows;
    const report = {
      capturedAt: new Date().toISOString(),
      letters: await read('SELECT id, symbol, name, order_index, is_deleted FROM public.letters ORDER BY order_index, id'),
      lessons: await read('SELECT id, type, title, order_index, is_lastlesson, is_deleted FROM public.letter_lessons ORDER BY order_index, id'),
      questionCounts: await read('SELECT letter_id, lesson_id, question_type, count(*)::integer AS count FROM public.questions_lessons WHERE is_deleted = 0 GROUP BY letter_id, lesson_id, question_type ORDER BY letter_id, lesson_id'),
      sampleQuestions: await read(`SELECT id, letter_id, lesson_id, question_type, question_text, correct_answer FROM (SELECT *, row_number() OVER (PARTITION BY lesson_id ORDER BY id) AS sample_rank FROM public.questions_lessons WHERE is_deleted = 0) q WHERE sample_rank <= 4 ORDER BY lesson_id,id`),
      games: await read('SELECT letter_id, lesson_id, game_type, order_index, is_deleted FROM public.games_lessons ORDER BY letter_id, order_index'),
      configCounts: await read('SELECT letter_id, lesson_id, game_type, count(*)::integer AS count FROM public.game_configs GROUP BY letter_id, lesson_id, game_type ORDER BY letter_id, lesson_id, game_type'),
      sampleConfigs: await read(`SELECT letter_id, lesson_id, game_type, data FROM (SELECT *, row_number() OVER (PARTITION BY game_type ORDER BY id) AS sample_rank FROM public.game_configs) c WHERE sample_rank = 1 ORDER BY game_type`),
    };
    await client.query('ROLLBACK');
    const output = path.join(root, 'docs/database/learning-content-reference.json');
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await client.end(); }
})().catch(error => { console.error(JSON.stringify({ code: error.code || 'INSPECTION_FAILED', message: 'Read-only curriculum inspection failed; connection details suppressed.' })); process.exitCode = 1; });
