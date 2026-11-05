/* Exports catalog metadata only. Never imports application connection modules. */
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");
const env = require("dotenv").parse(
  fs.readFileSync(path.join(__dirname, "../.env")),
);
const output = path.join(__dirname, "../../docs/database");
const qi = (value) => '"' + value.replaceAll('"', '""') + '"';
const qualified = (schema, name) => `${qi(schema)}.${qi(name)}`;

async function inspect(label, key) {
  if (!env[key]) throw new Error(`Missing configuration: ${key}`);
  const client = new Client({
    connectionString: env[key],
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    statement_timeout: 20000,
  });
  try {
    await client.connect();
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const query = async (sql) => (await client.query(sql)).rows;
    const tables =
      await query(`SELECT n.nspname AS schema, c.relname AS name, c.relkind AS kind,
      c.relispartition AS is_partition, c.relrowsecurity AS row_security,
      CASE WHEN c.relkind = 'p' THEN pg_get_partkeydef(c.oid) END AS partition_key
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast'
      AND c.relkind IN ('r','p') ORDER BY 1,2`);
    const columns =
      await query(`SELECT n.nspname AS schema, c.relname AS table_name, a.attname AS name,
      a.attnum AS position, format_type(a.atttypid,a.atttypmod) AS type,
      a.attnotnull AS not_null, a.attidentity AS identity, a.attgenerated AS generated,
      pg_get_expr(d.adbin,d.adrelid) AS default_expression
      FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
      JOIN pg_namespace n ON n.oid=c.relnamespace
      LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
      WHERE a.attnum>0 AND NOT a.attisdropped AND c.relkind IN ('r','p')
      AND n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast'
      ORDER BY 1,2,a.attnum`);
    const constraints =
      await query(`SELECT n.nspname AS schema, t.relname AS table_name,
      co.conname AS name, co.contype AS type, pg_get_constraintdef(co.oid,true) AS definition,
      rn.nspname AS referenced_schema, rt.relname AS referenced_table,
      ARRAY(SELECT a.attname FROM unnest(co.conkey) WITH ORDINALITY k(num,ord)
        JOIN pg_attribute a ON a.attrelid=co.conrelid AND a.attnum=k.num ORDER BY k.ord) AS columns,
      ARRAY(SELECT a.attname FROM unnest(co.confkey) WITH ORDINALITY k(num,ord)
        JOIN pg_attribute a ON a.attrelid=co.confrelid AND a.attnum=k.num ORDER BY k.ord) AS referenced_columns
      FROM pg_constraint co JOIN pg_class t ON t.oid=co.conrelid
      JOIN pg_namespace n ON n.oid=t.relnamespace
      LEFT JOIN pg_class rt ON rt.oid=co.confrelid LEFT JOIN pg_namespace rn ON rn.oid=rt.relnamespace
      WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast'
      AND t.relkind IN ('r','p') ORDER BY 1,2,3`);
    // pg may return PostgreSQL name[] values as strings rather than arrays.
    const parseArray = require("pg").types.getTypeParser(1009);
    for (const constraint of constraints) {
      for (const key of ["columns", "referenced_columns"]) {
        if (typeof constraint[key] === "string")
          constraint[key] = parseArray(constraint[key]);
      }
    }
    const indexes =
      await query(`SELECT n.nspname AS schema,t.relname AS table_name,i.relname AS name,
      pg_get_indexdef(i.oid) AS definition, co.conname AS constraint_name
      FROM pg_index ix JOIN pg_class i ON i.oid=ix.indexrelid JOIN pg_class t ON t.oid=ix.indrelid
      JOIN pg_namespace n ON n.oid=t.relnamespace LEFT JOIN pg_constraint co ON co.conindid=i.oid AND co.contype IN ('p','u','x')
      WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast' ORDER BY 1,2,3`);
    const sequences =
      await query(`SELECT n.nspname AS schema,c.relname AS name,format_type(s.seqtypid,NULL) AS type,
      s.seqstart::text AS start,s.seqincrement::text AS increment,s.seqmin::text AS min,s.seqmax::text AS max,
      s.seqcache::text AS cache,s.seqcycle AS cycle, tn.nspname AS owned_schema,t.relname AS owned_table,
      a.attname AS owned_column, d.deptype AS dependency_type
      FROM pg_sequence s JOIN pg_class c ON c.oid=s.seqrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      LEFT JOIN pg_depend d ON d.classid='pg_class'::regclass AND d.objid=c.oid AND d.refclassid='pg_class'::regclass AND d.deptype IN ('a','i')
      LEFT JOIN pg_class t ON t.oid=d.refobjid LEFT JOIN pg_namespace tn ON tn.oid=t.relnamespace
      LEFT JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=d.refobjsubid
      WHERE n.nspname NOT IN ('pg_catalog','information_schema') ORDER BY 1,2`);
    const enums =
      await query(`SELECT n.nspname AS schema,t.typname AS name,array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
      FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE n.nspname NOT IN ('pg_catalog','information_schema') GROUP BY 1,2 ORDER BY 1,2`);
    const views =
      await query(`SELECT schemaname AS schema,viewname AS name FROM pg_views
      WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY 1,2`);
    const triggers =
      await query(`SELECT n.nspname AS schema,c.relname AS table_name,t.tgname AS name
      FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE NOT t.tgisinternal AND n.nspname NOT IN ('pg_catalog','information_schema') ORDER BY 1,2,3`);
    await client.query("ROLLBACK");
    const data = {
      source:
        "live PostgreSQL system catalogs; read-only snapshot; no table rows",
      scope:
        "Table structure, columns, constraints, indexes, sequences and enums. Not a full pg_dump: excludes grants, owners, functions, policies, view/trigger definitions and data.",
      captured_at: new Date().toISOString(),
      tables,
      columns,
      constraints,
      indexes,
      sequences,
      enums,
      views,
      triggers,
    };
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
      path.join(output, `${label}.metadata.json`),
      JSON.stringify(data, null, 2) + "\n",
    );
    const sql = [
      "-- Actual table structure from a read-only catalog snapshot.",
      `-- Captured at ${data.captured_at}`,
      "-- No table data or connection credentials included.",
      "-- Structural export, not a full database backup. See metadata JSON for scope.",
      "-- Intended for review; not executed against any database.",
      "",
    ];
    for (const schema of [...new Set(tables.map((t) => t.schema))])
      sql.push(`CREATE SCHEMA IF NOT EXISTS ${qi(schema)};`);
    for (const e of enums)
      sql.push(
        `CREATE TYPE ${qualified(e.schema, e.name)} AS ENUM (${e.values.map((v) => "'" + v.replaceAll("'", "''") + "'").join(", ")});`,
      );
    for (const s of sequences.filter((s) => s.dependency_type !== "i"))
      sql.push(
        `CREATE SEQUENCE ${qualified(s.schema, s.name)} AS ${s.type} INCREMENT BY ${s.increment} MINVALUE ${s.min} MAXVALUE ${s.max} START WITH ${s.start} CACHE ${s.cache} ${s.cycle ? "CYCLE" : "NO CYCLE"};`,
      );
    for (const t of tables) {
      if (t.is_partition) {
        sql.push(
          `-- Partition ${qualified(t.schema, t.name)} omitted: see metadata.`,
        );
        continue;
      }
      const lines = columns
        .filter((c) => c.schema === t.schema && c.table_name === t.name)
        .map((c) => {
          let line = `  ${qi(c.name)} ${c.type}`;
          if (c.identity)
            line += ` GENERATED ${c.identity === "a" ? "ALWAYS" : "BY DEFAULT"} AS IDENTITY`;
          else if (c.generated)
            line += ` GENERATED ALWAYS AS (${c.default_expression}) STORED`;
          else if (c.default_expression !== null)
            line += ` DEFAULT ${c.default_expression}`;
          if (c.not_null) line += " NOT NULL";
          return line;
        });
      sql.push(
        `\nCREATE TABLE ${qualified(t.schema, t.name)} (\n${lines.join(",\n")}\n)${t.partition_key ? " PARTITION BY " + t.partition_key : ""};`,
      );
    }
    for (const s of sequences.filter(
      (s) => s.dependency_type === "a" && s.owned_column,
    ))
      sql.push(
        `ALTER SEQUENCE ${qualified(s.schema, s.name)} OWNED BY ${qualified(s.owned_schema, s.owned_table)}.${qi(s.owned_column)};`,
      );
    for (const c of constraints
      .filter((c) => c.type !== "f")
      .concat(constraints.filter((c) => c.type === "f")))
      sql.push(
        `ALTER TABLE ${qualified(c.schema, c.table_name)} ADD CONSTRAINT ${qi(c.name)} ${c.definition};`,
      );
    for (const i of indexes.filter((i) => !i.constraint_name))
      sql.push(i.definition + ";");
    fs.writeFileSync(
      path.join(output, `${label}.schema.sql`),
      sql.join("\n") + "\n",
    );
    console.log(
      JSON.stringify({
        database: label,
        tables: tables.length,
        columns: columns.length,
        foreign_keys: constraints.filter((c) => c.type === "f").length,
        views: views.length,
        triggers: triggers.length,
      }),
    );
  } finally {
    await client.end().catch(() => {});
  }
}

(async () => {
  for (const [label, key] of [
    ["project", "DB_URL"],
    ["activation", "Activation_DB"],
  ]) {
    if (!env[key]) {
      console.log(
        JSON.stringify({
          database: label,
          status: "skipped",
          reason: `${key} is not configured`,
        }),
      );
      continue;
    }
    try {
      await inspect(label, key);
    } catch (error) {
      console.error(
        JSON.stringify({
          database: label,
          error_code: error.code || "EXPORT_FAILED",
          message: "Metadata export failed; connection details suppressed.",
        }),
      );
      process.exitCode = 1;
    }
  }
})();
