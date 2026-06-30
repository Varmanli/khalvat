import { readFileSync } from "fs";

const bin = readFileSync("./node_modules/drizzle-kit/bin.cjs", "utf8");

// Get context around the driver check/selection
const nodePostgresIdx = bin.indexOf("node-postgres");
const postgresIdx = bin.indexOf('import("postgres")');

// Show what comes BEFORE node-postgres to see the if/else chain
console.log("Context around node-postgres check:");
console.log(bin.slice(Math.max(0, nodePostgresIdx - 500), nodePostgresIdx + 200));
