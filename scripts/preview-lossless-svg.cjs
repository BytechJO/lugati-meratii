/* Preview only: never overwrites source assets or changes application imports.
   PNG IDAT is one zlib stream across chunks: https://www.w3.org/TR/png/ */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { promisify } = require("node:util");

const deflate = promisify(zlib.deflate);
const gzip = promisify(zlib.gzip);
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "frontend/src/assets");
const outputDir = path.join(root, "docs/performance/image-compression-preview");
const pngUri = /data:image\/png;base64,([^"\s]+)/g;
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const cache = new Map();

const crcTable = Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function parsePng(bytes) {
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  const chunks = [];
  let offset = 8;
  while (offset < bytes.length) {
    const size = bytes.readUInt32BE(offset);
    assert(offset + size + 12 <= bytes.length, "Truncated PNG chunk");
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    assert.equal(crc32(bytes.subarray(offset + 4, offset + 8 + size)), bytes.readUInt32BE(offset + 8 + size), "PNG CRC mismatch");
    chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + size), raw: bytes.subarray(offset, offset + size + 12) });
    offset += size + 12;
  }
  assert.equal(chunks[0].type, "IHDR");
  assert.equal(chunks.at(-1).type, "IEND");
  assert(!chunks.some(chunk => chunk.type === "acTL"), "Animated PNGs are outside this preview's scope");
  return chunks;
}
function makeIdat(data) {
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write("IDAT", 4, "ascii");
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, -4)), chunk.length - 4);
  return chunk;
}
const imageData = chunks => Buffer.concat(chunks.filter(chunk => chunk.type === "IDAT").map(chunk => chunk.data));
const otherChunks = chunks => Buffer.concat(chunks.filter(chunk => chunk.type !== "IDAT").map(chunk => chunk.raw));

async function optimizePng(original) {
  const hash = sha(original);
  if (cache.has(hash)) return cache.get(hash);
  const chunks = parsePng(original);
  const raw = zlib.inflateSync(imageData(chunks));
  let bestStream = imageData(chunks);
  let strategyName = "original compressed stream";
  for (const [strategy, label] of [[zlib.constants.Z_DEFAULT_STRATEGY, "default"], [zlib.constants.Z_FILTERED, "filtered"], [zlib.constants.Z_RLE, "rle"]]) {
    const candidate = await deflate(raw, { level: 9, memLevel: 9, strategy });
    if (candidate.length < bestStream.length) { bestStream = candidate; strategyName = label; }
  }
  const parts = [original.subarray(0, 8)];
  let inserted = false;
  for (const chunk of chunks) {
    if (chunk.type !== "IDAT") parts.push(chunk.raw);
    else if (!inserted) { parts.push(makeIdat(bestStream)); inserted = true; }
  }
  assert(inserted, "PNG has no image data");
  const candidate = Buffer.concat(parts);
  const optimized = candidate.length < original.length ? candidate : original;
  const afterChunks = parsePng(optimized);
  assert(raw.equals(zlib.inflateSync(imageData(afterChunks))), "Image scanlines changed");
  assert(otherChunks(chunks).equals(otherChunks(afterChunks)), "PNG dimensions, color or metadata chunks changed");
  const result = { optimized, metadata: {
    width: chunks[0].data.readUInt32BE(0), height: chunks[0].data.readUInt32BE(4),
    originalBytes: original.length, optimizedBytes: optimized.length,
    scanlinesSha256: sha(raw), pngMetadataSha256: sha(otherChunks(chunks)),
    method: strategyName, identicalScanlines: true, identicalMetadata: true,
  } };
  cache.set(hash, result);
  return result;
}

function codeFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? codeFiles(path.join(dir, entry.name)) : /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [path.join(dir, entry.name)] : []);
}

(async () => {
  const selected = fs.readdirSync(sourceDir).filter(name => name.endsWith(".svg"))
    .map(name => ({ name, bytes: fs.statSync(path.join(sourceDir, name)).size }))
    .sort((a, b) => b.bytes - a.bytes).slice(0, 5);
  const sources = codeFiles(path.join(root, "frontend/src")).map(file => ({ file, text: fs.readFileSync(file, "utf8") }));
  fs.mkdirSync(path.join(outputDir, "assets"), { recursive: true });
  const results = [];
  for (const { name } of selected) {
    const inputPath = path.join(sourceDir, name);
    const original = fs.readFileSync(inputPath);
    const text = original.toString("utf8");
    const embeddedPngs = [];
    let updated = "";
    let lastIndex = 0;
    for (const match of text.matchAll(pngUri)) {
      updated += text.slice(lastIndex, match.index);
      const result = await optimizePng(Buffer.from(match[1], "base64"));
      updated += "data:image/png;base64," + result.optimized.toString("base64");
      embeddedPngs.push(result.metadata);
      lastIndex = match.index + match[0].length;
    }
    updated += text.slice(lastIndex);
    assert.equal(text.replace(pngUri, "[UNCHANGED_PNG_PIXELS]"), updated.replace(pngUri, "[UNCHANGED_PNG_PIXELS]"), "SVG markup changed");
    assert.equal(text.match(/<svg\b[^>]*>/)[0], updated.match(/<svg\b[^>]*>/)[0], "SVG viewport changed");
    const optimized = Buffer.from(updated);
    assert(optimized.length <= original.length);
    fs.writeFileSync(path.join(outputDir, "assets", name), optimized);
    assert.equal(sha(fs.readFileSync(inputPath)), sha(original), "Original file changed");
    const result = {
      file: name, originalBytes: original.length, optimizedBytes: optimized.length,
      savedBytes: original.length - optimized.length,
      savedPercent: Number(((1 - optimized.length / original.length) * 100).toFixed(2)),
      originalGzipBytes: (await gzip(original, { level: 6 })).length,
      optimizedGzipBytes: (await gzip(optimized, { level: 6 })).length,
      originalSha256: sha(original), optimizedSha256: sha(optimized),
      svgRoot: text.match(/<svg\b[^>]*>/)[0], embeddedPngs,
      referencedBy: sources.filter(source => source.text.includes(name)).map(source => path.relative(root, source.file).replaceAll("\\", "/")),
    };
    results.push(result);
    console.log(JSON.stringify({ file: name, before: result.originalBytes, after: result.optimizedBytes, savedPercent: result.savedPercent, verified: true }));
  }
  const total = key => results.reduce((sum, result) => sum + result[key], 0);
  const report = { mode: "preview-only", generatedAt: new Date().toISOString(),
    scope: "Same SVG and PNG formats. No resize, cropping, SVG markup edits, color changes, metadata removal or lossy recompression. Only PNG IDAT repacking and lossless zlib compression.",
    sourceAssetsUnchanged: true, applicationImportsUnchanged: true, results,
    totals: { originalBytes: total("originalBytes"), optimizedBytes: total("optimizedBytes"), savedBytes: total("savedBytes"), originalGzipBytes: total("originalGzipBytes"), optimizedGzipBytes: total("optimizedGzipBytes") },
  };
  fs.writeFileSync(path.join(outputDir, "comparison.json"), JSON.stringify(report, null, 2) + "\n");
  const mib = bytes => (bytes / 1024 / 1024).toFixed(2);
  const md = ["# تجربة ضغط الصور دون تغيير الأبعاد أو الجودة", "",
    "هذه نسخ تجريبية فقط. لم تُستبدل الصور الأصلية ولم تتغير استيرادات التطبيق، لذلك لا يوجد تحسن مطبق على الموقع بعد.", "",
    "تمت إعادة ضغط PNG المضمّن داخل أكبر خمسة ملفات SVG، مع الاحتفاظ بنفس الصيغ، والأبعاد الداخلية والخارجية، والشفافية، والألوان والبيانات الوصفية. لم يتم قص الصور أو إعادة تحجيمها. بقي محتوى SVG خارج بيانات PNG مطابقاً حرفياً.", "",
    "| الملف | قبل MiB | بعد MiB | التوفير |", "| --- | ---: | ---: | ---: |",
    ...results.map(result => `| [${result.file}](assets/${encodeURIComponent(result.file)}) | ${mib(result.originalBytes)} | ${mib(result.optimizedBytes)} | ${result.savedPercent}% |`), "",
    `الإجمالي: ${mib(total("originalBytes"))} MiB → ${mib(total("optimizedBytes"))} MiB؛ توفير ${mib(total("savedBytes"))} MiB.`, "",
    `تقدير ملفات gzip بالمستوى 6: ${mib(total("originalGzipBytes"))} MiB → ${mib(total("optimizedGzipBytes"))} MiB. هذا قياس محلي للملفات وليس قياساً لشبكة الموقع المنشور.`, "",
    "## التحقق", "",
    "- تطابق بيانات المسح الأصلية بعد فك ضغط PNG حرفياً، وليس مقارنة تقريبية للألوان.",
    "- تطابق جميع أجزاء PNG خارج IDAT، بما فيها IHDR وبيانات الألوان والدقة، مع فحص CRC لكل جزء.",
    "- تطابق SVG وwidth وheight وviewBox خارج بيانات PNG المستبدلة.",
    "- التحقق من بقاء الملفات الأصلية على نفس SHA-256.", "",
    "الأحجام والمرجعيات التفصيلية وبصمات التحقق في [comparison.json](comparison.json). المرجعيات النصية ليست إثباتاً لتنزيل الملفات عند أول فتح؛ الملفات غير المستخدمة لا يؤدي ضغطها إلى تسريع الصفحات الحالية.", "",
    "## إعادة التجربة", "", "من جذر المشروع:", "", "```powershell", "node scripts/preview-lossless-svg.cjs", "```", "",
    "المخرجات محصورة في مجلد هذه التجربة، ولا يكتب السكربت داخل frontend/src/assets. طريقة تقسيم IDAT وإعادة ضغطه تتبع [مواصفة PNG](https://www.w3.org/TR/png/).", "",
  ];
  fs.writeFileSync(path.join(outputDir, "README_AR.md"), md.join("\n"));
  console.log(JSON.stringify({ totals: report.totals, originalsUnchanged: true, output: path.relative(root, outputDir) }));
})().catch(error => { console.error(error); process.exitCode = 1; });
