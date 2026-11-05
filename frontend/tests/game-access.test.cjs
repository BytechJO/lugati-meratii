const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { transformSync } = require("@swc/core");

test("teacher preview never mounts gameplay; students retain gameplay", () => {
  let user = { type: "teacher" };
  let mounted = 0;
  const filename = path.resolve(__dirname, "../src/components/games/GameAccess.tsx");
  const { code } = transformSync(fs.readFileSync(filename, "utf8"), {
    filename,
    jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (id) => {
      if (id === "../../redux/hooks") return { useAppSelector: (select) => select({ auth: { user } }) };
      if (id === "./GamePreview") return { GamePreview: ({ gameType }) => React.createElement("p", null, `preview:${gameType}`) };
      if (id === "react-router-dom") return { Navigate: () => React.createElement("p", null, "redirect") };
      return require(id);
    },
  });
  const { GameAccess } = module.exports;
  const Gameplay = () => { mounted++; return React.createElement("p", null, "playing"); };
  for (const gameType of ["word_catch", "sorting", "memory_match", "balloon_pop"]) {
    const view = () => renderToStaticMarkup(React.createElement(GameAccess, { gameType }, React.createElement(Gameplay)));
    user = { type: "teacher" };
    assert.match(view(), new RegExp(`preview:${gameType}`));
    assert.equal(mounted, 0);
    user = null;
    assert.match(view(), /redirect/);
    assert.equal(mounted, 0);
  }
  user = { type: "student" };
  const studentView = renderToStaticMarkup(React.createElement(GameAccess, { gameType: "sorting" }, React.createElement(Gameplay)));
  assert.match(studentView, /playing/);
  assert.equal(mounted, 1);
});
