const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'docs/database');
const curriculum = JSON.parse(fs.readFileSync(path.join(folder, 'arabic-exercises.content.json'), 'utf8'));
const plain = word => word.normalize('NFC').replace(/[\u064b-\u065f\u0670\u0640]/g, '');
const matches = (char, symbol) => symbol === 'أ' ? 'أإآا'.includes(char) : char === symbol;
const begins = (word, symbol) => matches(plain(word)[0], symbol);
const harakat = [
  { answer: 'fatha', mark: '\u064e', label: 'فتحة' },
  { answer: 'damma', mark: '\u064f', label: 'ضمة' },
  { answer: 'kasra', mark: '\u0650', label: 'كسرة' },
  { answer: 'sukun', mark: '\u0652', label: 'سكون' },
];
const positions = ['start', 'middle', 'end', 'start'];
const positionLabels = { start: 'البداية', middle: 'الوسط', end: 'النهاية' };
assert.equal(curriculum.length, 28);
assert.equal(new Set(curriculum.map(letter => letter.symbol)).size, 28);
const dataset = curriculum.map(letter => {
  assert.equal(letter.words.length, 6);
  assert.equal(new Set(letter.words).size, 6);
  assert(letter.words.every(word => begins(word, letter.symbol)), `Wrong starting letter: ${letter.symbol}`);
  assert.equal(letter.position.length, 4);
  assert.equal(letter.harakat.length, 4);
  const positionQuestions = letter.position.map((word, index) => {
    const chars = [...plain(word)];
    const occurrences = chars.map((char, i) => matches(char, letter.symbol) ? i : -1).filter(i => i >= 0);
    assert.equal(occurrences.length, 1, `Ambiguous position: ${letter.symbol} / ${word}`);
    const actual = occurrences[0] === 0 ? 'start' : occurrences[0] === chars.length - 1 ? 'end' : 'middle';
    assert.equal(actual, positions[index], `Incorrect position: ${letter.symbol} / ${word}`);
    return { answer: actual, text: { word, position: positionLabels[actual] } };
  });
  const harakatQuestions = letter.harakat.map((word, index) => {
    const chars = [...word.normalize('NFC')];
    const occurrences = chars.map((char, i) => matches(char, letter.symbol) ? i : -1).filter(i => i >= 0);
    assert.equal(occurrences.length, 1, `Ambiguous haraka: ${letter.symbol} / ${word}`);
    let marks = '';
    for (let i = occurrences[0] + 1; i < chars.length && /\p{M}/u.test(chars[i]); i++) marks += chars[i];
    assert(marks.includes(harakat[index].mark), `Wrong haraka: ${letter.symbol} / ${word}`);
    const syllable = chars[occurrences[0]] + harakat[index].mark;
    return { answer: harakat[index].answer, text: { letter: syllable, sound: `${syllable} (${harakat[index].label})`, word, shakl: harakat[index].label } };
  });
  const wrong = curriculum.filter(item => item.symbol !== letter.symbol).map(item => item.words[0]).filter(word => !begins(word, letter.symbol)).slice(0, 6);
  assert.equal(wrong.length, 6);
  const items = letter.words.slice(0, 5).flatMap((word, index) => [{ word, startsWithTarget: true }, { word: wrong[index], startsWithTarget: false }]);
  return {
    symbol: letter.symbol,
    exercises: [
      { lesson_id: 3, question_type: 'harakat', questions: harakatQuestions },
      { lesson_id: 12, question_type: 'position', questions: positionQuestions },
    ],
    games: [
      { game_type: 'word_catch', order_index: 1, data: { correctWords: letter.words, wrongWords: wrong, maxMistakes: 3, scorePerCorrect: 10, spawnIntervalMs: 2000, minSpeed: 2, maxSpeed: 5, instruction: `اصطد الكلمات التي تبدأ بحرف ${letter.name} فقط!` } },
      { game_type: 'sorting', order_index: 2, data: { title: `صنف كلمات حرف ${letter.name}`, instruction: 'اسحب الكلمات إلى المكان الصحيح', targetLetter: letter.symbol, scorePerCorrect: 10, maxMistakes: 3, items } },
      { game_type: 'memory_match', order_index: 3, data: { title: `ذاكرة حرف ${letter.name}`, instruction: 'اقلب البطاقات وطابق الحرف مع الكلمة التي تبدأ به', scorePerMatch: 10, pairs: letter.words.map(word => ({ letter: word[0], word })) } },
      { game_type: 'balloon_pop', order_index: 4, data: { title: `بالونات حرف ${letter.name}`, instruction: `افرقع البالونات التي تحمل كلمات تبدأ بحرف ${letter.name}`, targetLetter: letter.symbol, scorePerCorrect: 10, maxMistakes: 3, spawn: { baseInterval: 1500, levelFactor: 100, minInterval: 800 }, speed: { baseDuration: 6, levelIncrease: 0.3, minDuration: 2 }, words: items } },
    ],
  };
});

const sql = `-- Complete missing Arabic exercises only. No UPDATE, DELETE or schema changes.
-- Existing question IDs, game IDs, configurations and learner records are preserved.
-- Execute this ENTIRE file in the Neon SQL Editor for the project's database.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
LOCK TABLE public.questions_lessons, public.games_lessons, public.game_configs
  IN SHARE ROW EXCLUSIVE MODE;

DO $seed_missing$
DECLARE
  seed jsonb := $learning_content$${JSON.stringify(dataset, null, 2)}$learning_content$::jsonb;
  letter_record jsonb;
  exercise jsonb;
  candidate jsonb;
  game_record jsonb;
  existing_question record;
  existing_word text;
  existing_words text[];
  letter_key integer;
  lesson_key integer;
  question_count integer;
  affected integer;
  questions_added integer := 0;
  games_added integer := 0;
  configs_added integer := 0;
BEGIN
  -- These IDs match the existing frontend. Do not create or renumber lessons.
  IF (SELECT count(*) FROM public.letter_lessons
      WHERE id IN (3, 5, 12) AND is_deleted = 0) <> 3 THEN
    RAISE EXCEPTION 'Required active lesson IDs 3, 5, 12 are missing. Nothing was added.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.letter_lessons WHERE id = 5 AND type = 'game' AND is_lastlesson = true) THEN
    RAISE EXCEPTION 'Lesson 5 must be the existing shared games lesson. Nothing was added.';
  END IF;
  -- Validate every letter before inserting anything.
  FOR letter_record IN SELECT value FROM jsonb_array_elements(seed) LOOP
    IF (SELECT count(*) FROM public.letters
        WHERE symbol = letter_record->>'symbol' AND is_deleted = 0) <> 1 THEN
      RAISE EXCEPTION 'Expected exactly one active letter for symbol %. Nothing was added.', letter_record->>'symbol';
    END IF;
  END LOOP;

  FOR letter_record IN SELECT value FROM jsonb_array_elements(seed) LOOP
    SELECT id INTO STRICT letter_key FROM public.letters
      WHERE symbol = letter_record->>'symbol' AND is_deleted = 0;

    FOR exercise IN SELECT value FROM jsonb_array_elements(letter_record->'exercises') LOOP
      lesson_key := (exercise->>'lesson_id')::integer;
      SELECT count(*) INTO question_count FROM public.questions_lessons
        WHERE letter_id = letter_key AND lesson_id = lesson_key AND is_deleted = 0;
      IF question_count >= 4 THEN CONTINUE; END IF;
      existing_words := ARRAY[]::text[];
      FOR existing_question IN
        SELECT question_text FROM public.questions_lessons
        WHERE letter_id = letter_key AND lesson_id = lesson_key AND is_deleted = 0
      LOOP
        BEGIN
          existing_word := existing_question.question_text::jsonb->>'word';
          IF existing_word IS NOT NULL THEN
            existing_words := array_append(existing_words, existing_word);
          END IF;
        EXCEPTION WHEN invalid_text_representation THEN
          RAISE NOTICE 'Existing invalid question JSON for letter %, lesson % was preserved.', letter_record->>'symbol', lesson_key;
        END;
      END LOOP;

      -- Fill missing answer categories first, then complete up to four questions.
      FOR candidate IN
        SELECT question.value FROM jsonb_array_elements(exercise->'questions')
          WITH ORDINALITY AS question(value, ordinal)
        ORDER BY CASE WHEN EXISTS (
          SELECT 1 FROM public.questions_lessons q
          WHERE q.letter_id = letter_key AND q.lesson_id = lesson_key
            AND q.is_deleted = 0 AND q.correct_answer = question.value->>'answer'
        ) THEN 1 ELSE 0 END, question.ordinal
      LOOP
        EXIT WHEN question_count >= 4;
        IF candidate->'text'->>'word' = ANY(existing_words) THEN CONTINUE; END IF;
        INSERT INTO public.questions_lessons
          (letter_id, lesson_id, question_text, correct_answer, question_type, is_deleted)
        VALUES (letter_key, lesson_key, (candidate->'text')::text,
          candidate->>'answer', exercise->>'question_type', 0);
        question_count := question_count + 1;
        questions_added := questions_added + 1;
        existing_words := array_append(existing_words, candidate->'text'->>'word');
      END LOOP;
    END LOOP;

    FOR game_record IN SELECT value FROM jsonb_array_elements(letter_record->'games') LOOP
      INSERT INTO public.games_lessons (letter_id, lesson_id, game_type, order_index, is_deleted)
      SELECT letter_key, 5, game_record->>'game_type', (game_record->>'order_index')::integer, 0
      WHERE NOT EXISTS (SELECT 1 FROM public.games_lessons
        WHERE letter_id = letter_key AND game_type = game_record->>'game_type')
      ON CONFLICT (letter_id, game_type) DO NOTHING;
      GET DIAGNOSTICS affected = ROW_COUNT;
      games_added := games_added + affected;

      -- Do not reactivate deleted games or reassign an existing game's lesson.
      IF EXISTS (SELECT 1 FROM public.games_lessons
        WHERE letter_id = letter_key AND lesson_id = 5
          AND game_type = game_record->>'game_type' AND is_deleted = 0) THEN
        INSERT INTO public.game_configs (letter_id, lesson_id, game_type, data)
        SELECT letter_key, 5, game_record->>'game_type', game_record->'data'
        WHERE NOT EXISTS (SELECT 1 FROM public.game_configs
          WHERE letter_id = letter_key AND lesson_id = 5 AND game_type = game_record->>'game_type');
        GET DIAGNOSTICS affected = ROW_COUNT;
        configs_added := configs_added + affected;
      ELSE
        RAISE NOTICE 'Existing deleted/differently linked game for letter %, type % was preserved.', letter_record->>'symbol', game_record->>'game_type';
      END IF;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Added % questions, % games, % game configurations. Existing content was preserved.', questions_added, games_added, configs_added;
END;
$seed_missing$;

-- This result should show 4, 4, 4, 4 for every letter with ordinary current data.
SELECT l.symbol, l.name,
  (SELECT count(*) FROM public.questions_lessons q WHERE q.letter_id = l.id AND q.lesson_id = 3 AND q.is_deleted = 0) AS tashkeel_questions,
  (SELECT count(*) FROM public.questions_lessons q WHERE q.letter_id = l.id AND q.lesson_id = 12 AND q.is_deleted = 0) AS position_questions,
  (SELECT count(DISTINCT g.game_type) FROM public.games_lessons g WHERE g.letter_id = l.id AND g.lesson_id = 5 AND g.is_deleted = 0 AND g.game_type IN ('word_catch','sorting','memory_match','balloon_pop')) AS games,
  (SELECT count(DISTINCT c.game_type) FROM public.game_configs c JOIN public.games_lessons g
    ON g.letter_id = c.letter_id AND g.lesson_id = c.lesson_id AND g.game_type = c.game_type
    WHERE c.letter_id = l.id AND c.lesson_id = 5 AND g.is_deleted = 0 AND c.game_type IN ('word_catch','sorting','memory_match','balloon_pop')) AS configured_games
FROM public.letters l WHERE l.is_deleted = 0 ORDER BY l.order_index, l.id;
COMMIT;
`;
fs.writeFileSync(path.join(folder, 'seed-missing-arabic-exercises.sql'), sql);
fs.writeFileSync(path.join(folder, 'arabic-exercises.seed.json'), JSON.stringify(dataset, null, 2) + '\n');
console.log(JSON.stringify({ letters: dataset.length, candidateQuestions: dataset.length * 8, gameConfigurations: dataset.length * 4, sql: 'docs/database/seed-missing-arabic-exercises.sql', validated: 'All answer positions, target vowel marks, unique target occurrences and game starting letters checked.' }));
