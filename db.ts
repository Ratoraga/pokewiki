import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

const query = db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        username        TEXT NOT NULL UNIQUE,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS times (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT NOT NULL,
        membros         TEXT NOT NULL
    );
`);


query.run();

export { db }