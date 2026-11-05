const fs = require("node:fs");
const path = require("node:path");
const folder = path.join(__dirname, "../../docs/database");
const db = JSON.parse(
  fs.readFileSync(path.join(folder, "project.metadata.json"), "utf8"),
);
const cell = (value) =>
  String(value ?? "—")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
const md = [
  "# السكيما الفعلية والعلاقات بين جداول المشروع",
  "",
  "المصدر: قراءة مباشرة من كتالوج PostgreSQL باستخدام اتصال `DB_URL` الخاص بالمشروع، ضمن معاملة للقراءة فقط. لم تُقرأ سجلات الجداول ولم تُنفذ تغييرات على قاعدة البيانات.",
  "",
  `وقت الالتقاط: ${new Date(db.captured_at).toLocaleString("en-GB", { timeZone: "Asia/Amman", hour12: false })} بتوقيت عمّان.`,
  "",
  `النتيجة: **${db.tables.length} جدولاً، ${db.columns.length} عمود، ${db.constraints.filter((c) => c.type === "f").length} علاقة Foreign Key**.`,
  "",
  "## ملفات الاستخراج",
  "",
  "- [السكيما بصيغة SQL](project.schema.sql): تعريف الجداول والأعمدة والقيم الافتراضية والتسلسلات والقيود والفهارس المستخرجة فعلياً.",
  "- [البيانات الوصفية بصيغة JSON](project.metadata.json): مرجع آلي للخصائص والعلاقات.",
  "- هذا تصدير لبنية الجداول، وليس نسخة احتياطية كاملة من نوع `pg_dump`. لا يتضمن البيانات أو كلمات الاتصال أو ملكية الكائنات أو الصلاحيات أو الدوال أو تعريفات السياسات. لا توجد Views أو Triggers غير داخلية ضمن نتائج الاستعلامات لهذه القاعدة.",
  "- اتصال `Activation_DB` غير مضبوط في ملف البيئة المحلي وقت المراجعة، ولذلك لم تُستخرج قاعدة التفعيل ولا جدول `activation_codes`. أي ربط معه في كود التطبيق ليس Foreign Key مثبتاً في هذا التصدير.",
  "",
  "## كيف ترتبط أجزاء النظام؟",
  "",
  "- المستخدم يرتبط بدور عبر `users.role_id`، والدور يرتبط بالصلاحيات عبر جدول الربط `role_permissions`.",
  "- الصف يرتبط بمستخدم عبر `teacher_id`، ويربط `class_student` الطلاب بالصفوف. تسميات teacher وstudent تعبر عن دور التطبيق؛ المفتاح الأجنبي وحده لا يفرض نوع دور المستخدم.",
  "- حسب تصميم المشروع الذي أكده صاحب المشروع، يحتوي `letter_lessons` خمسة دروس ثابتة مشتركة لكل الحروف. عدم وجود `letter_id` فيه مقصود؛ المحتوى والتقدم الخاصان بكل حرف يرتبطان بالحرف والدرس عبر جداول الفيديوهات والألعاب والأسئلة وإعدادات الألعاب والتقدم.",
  "- إجابات الطالب ترتبط بالمستخدم والسؤال والدرس، ونتائج الألعاب ترتبط بالمستخدم واللعبة، ونتائج الدروس ترتبط بالمستخدم والدرس.",
  "- الحذف المنطقي موجود في عدة جداول من خلال `is_deleted`؛ المفتاح الأجنبي لا يتحقق من هذه العلامة.",
  "",
  "## رسم العلاقات الفعلية ERD",
  "",
  "كل خط في الرسم يقابله Foreign Key موجود فعلياً. الدائرة عند جهة الأب تعني أن عمود الربط يقبل NULL، والخط يعني أن الارتباط إلزامي. جهة الأب يمكن أن ترتبط بصفر أو عدة سجلات تابعة.",
  "",
  "```mermaid",
  "erDiagram",
];
for (const table of db.tables) {
  md.push(`  ${table.name} {`);
  for (const c of db.columns.filter(
    (c) => c.table_name === table.name && c.schema === table.schema,
  )) {
    const flags = [];
    if (
      db.constraints.some(
        (k) =>
          k.schema === c.schema &&
          k.table_name === c.table_name &&
          k.type === "p" &&
          k.columns.includes(c.name),
      )
    )
      flags.push("PK");
    if (
      db.constraints.some(
        (k) =>
          k.schema === c.schema &&
          k.table_name === c.table_name &&
          k.type === "f" &&
          k.columns.includes(c.name),
      )
    )
      flags.push("FK");
    const type = c.type.replaceAll(" ", "_").replace(/[^a-zA-Z0-9_]/g, "");
    md.push(
      `    ${type} ${c.name}${flags.length ? " " + flags.join(",") : ""}`,
    );
  }
  md.push("  }");
}
for (const fk of db.constraints.filter((c) => c.type === "f")) {
  const required = fk.columns.every(
    (name) =>
      db.columns.find(
        (c) =>
          c.schema === fk.schema &&
          c.table_name === fk.table_name &&
          c.name === name,
      ).not_null,
  );
  md.push(
    `  ${fk.referenced_table} ${required ? "||" : "|o"}--o{ ${fk.table_name} : "${fk.columns.join(", ")}"`,
  );
}
md.push(
  "```",
  "",
  "## قائمة المفاتيح الأجنبية",
  "",
  "| الجدول والعمود | الجدول والعمود المرجعي | تعريف القيد |",
  "| --- | --- | --- |",
);
for (const fk of db.constraints.filter((c) => c.type === "f"))
  md.push(
    `| \`${fk.table_name}.${fk.columns.join(", ")}\` | \`${fk.referenced_table}.${fk.referenced_columns.join(", ")}\` | ${cell(fk.definition)} |`,
  );
md.push(
  "",
  "## الأعمدة والقيود لكل جدول",
  "",
  "تعرض خانة «يقبل NULL» السماح بالقيمة الفارغة حسب كتالوج القاعدة. القيم الافتراضية تعريفات بنيوية وليست سجلات مستخدمين.",
);
for (const table of db.tables) {
  md.push(
    "",
    `### ${table.schema}.${table.name}`,
    "",
    "| العمود | النوع | يقبل NULL | القيمة الافتراضية |",
    "| --- | --- | --- | --- |",
  );
  for (const c of db.columns.filter(
    (c) => c.table_name === table.name && c.schema === table.schema,
  ))
    md.push(
      `| \`${c.name}\` | ${cell(c.type)} | ${c.not_null ? "لا" : "نعم"} | ${cell(c.default_expression)} |`,
    );
  md.push("", "القيود:", "");
  for (const k of db.constraints.filter(
    (c) => c.table_name === table.name && c.schema === table.schema,
  ))
    md.push(`- \`${k.name}\`: \`${k.definition}\`.`);
  const indexes = db.indexes.filter(
    (i) =>
      i.table_name === table.name &&
      i.schema === table.schema &&
      !i.constraint_name,
  );
  if (indexes.length) {
    md.push("", "الفهارس الإضافية غير المملوكة لقيد:", "");
    for (const i of indexes) md.push(`- \`${i.definition}\`.`);
  }
}
md.push(
  "",
  "## ملاحظات مستندة إلى البنية الفعلية",
  "",
  "- الدروس الخمسة كتالوج مشترك؛ لا يحتاج التطبيق إلى إنشاء أو حذف درس لكل حرف. أزيلت وظائف ومسارات إنشاء وحذف الدروس من الخادم، وصُححت الاستعلامات لتربط الحرف بالمحتوى والتقدم بدلاً من افتراض `letter_lessons.letter_id`. ملفات SQL الأصلية بقيت كما هي، وتعريف `db.sql` المحلي المختلف ليس مرجع البنية الفعلية.",
  "- وجود `letter_id` و`lesson_id` معاً في عدة جداول لا يفرض تلقائياً أن الحرف والدرس يشكلان اقتراناً صحيحاً؛ القيود الحالية تتحقق من وجود كل مرجع على حدة.",
  "- `users.activation_code` عمود نصي، ولا توجد له علاقة FK في قاعدة المشروع إلى قاعدة التفعيل المنفصلة.",
  "- القيد الفريد في `student_game_results` يجمع الطالب واللعبة؛ وبالاشتراك مع منطق Upsert الحالي، يعكس السجل النتيجة المحدّثة وليس تاريخ المحاولات.",
  "- نتائج الاستخراج تمثل وقت الالتقاط فقط. لا يختبر هذا العمل استعادة السكيما في قاعدة جديدة ولا يغير البيانات.",
  "",
  "## إعادة الاستخراج",
  "",
  "من مجلد `backend` بعد ضبط الاتصال في `.env`:",
  "",
  "```powershell",
  "node scripts/export-schema.cjs",
  "node scripts/document-schema.cjs",
  "```",
  "",
  "الأمر الأول يستعلم عن الكتالوج فقط ويحفظ الملفات محلياً، والثاني يولد هذه الوثيقة من JSON. لا تستخدم `app.js` للاستخراج، لتجنب تشغيل التطبيق أو تسجيل سلسلة اتصال التفعيل.",
  "",
);
fs.writeFileSync(path.join(folder, "DATABASE_SCHEMA_AR.md"), md.join("\n"));
console.log("Generated docs/database/DATABASE_SCHEMA_AR.md");
