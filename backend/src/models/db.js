const { Pool } = require("pg");

const connectionString = process.env.DB_URL;

 const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Neon يحتاج SSL
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});


// pool
//   .connect()
//   .then((res) => {
//     console.log(`DB connected to ${res.database}`);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
pool.on("error", (err) => {
  console.error("Postgres pool error:", err); // مهم: يمنع crash بسبب unhandled
});
module.exports = pool;
