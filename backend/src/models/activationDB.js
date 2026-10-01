const { Pool } = require("pg");

const connectionString = process.env.Activation_DB;
console.log(connectionString);

const ActivationDB = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Neon يحتاج SSL
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});

ActivationDB.on("error", (err) => {
  console.error("Postgres pool error:", err); // مهم: يمنع crash بسبب unhandled
});
// ActivationDB.connect()
//   .then((res) => {
//     console.log(`DB connected to ${res.database}`);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = ActivationDB;
