const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { transformSync } = require("@swc/core");

function loadTs(filename, overrides = {}) {
  const module = { exports: {} };
  const { code } = transformSync(fs.readFileSync(filename, "utf8"), {
    filename, jsc: { parser: { syntax: "typescript" }, target: "es2022" }, module: { type: "commonjs" },
  });
  vm.runInNewContext(code, { module, exports: module.exports, console: { error() {} }, require: (id) => overrides[id] ?? require(id) });
  return module.exports;
}

test("each activity sends completion for its letter and shared lesson", async () => {
  const requests = [];
  const { completeActivity } = loadTs(path.resolve(__dirname, "../src/API/userProgress.ts"), {
    "./axios": { __esModule: true, default: { post: async (url, body) => { requests.push({ url, body }); return { data: { success: true } }; } } },
  });
  for (const [activity, lesson] of [["learn", 1], ["write", 2], ["position", 12], ["tashkeel", 3], ["video", 4], ["game", 5]]) {
    await completeActivity(activity, 7, 3);
    const request = requests.at(-1);
    assert.equal(request.url, "/progress/upsertProgress");
    assert.deepEqual(JSON.parse(JSON.stringify(request.body)), { letter_id: 7, lesson_id: lesson, lesson_type: activity, score: 3, completed: true });
  }
  assert.throws(() => completeActivity("learn", undefined, 1));
  assert.equal(requests.length, 6);
});

test("progress saver deduplicates pending saves, retries failures, and excludes teachers", async () => {
  let writes = 0;
  let release;
  let failure = false;
  let user = { id: "12", type: "student" };
  const { useLessonProgress } = loadTs(path.resolve(__dirname, "../src/hooks/useLessonProgress.ts"), {
    "../redux/hooks": { useAppSelector: (select) => select({ auth: { user } }) },
    "../API/userProgress": { completeActivity: async () => {
      writes++;
      if (failure) throw new Error("Offline");
      await new Promise((resolve) => { release = resolve; });
    } },
  });
  let progress;
  function Harness() { progress = useLessonProgress(7, "position"); return null; }
  renderToStaticMarkup(React.createElement(Harness));
  const first = progress.saveProgress(4);
  const duplicate = progress.saveProgress(4);
  assert.equal(first, duplicate);
  assert.equal(writes, 1);
  release();
  assert.equal(await first, true);
  assert.equal(await progress.saveProgress(4), true);
  assert.equal(writes, 1);

  failure = true;
  renderToStaticMarkup(React.createElement(Harness));
  assert.equal(await progress.saveProgress(4), false);
  assert.equal(writes, 2);
  failure = false;
  const retry = progress.saveProgress(4);
  assert.equal(writes, 3);
  release();
  assert.equal(await retry, true);

  user = { id: "13", type: "teacher" };
  renderToStaticMarkup(React.createElement(Harness));
  assert.equal(await progress.saveProgress(4), true);
  assert.equal(writes, 3);
});
