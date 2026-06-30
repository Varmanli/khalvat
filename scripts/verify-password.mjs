import crypto from "crypto";

function hmac(key, str) {
  return crypto.createHmac("sha256", key).update(str).digest();
}
function sha256(x) {
  return crypto.createHash("sha256").update(x).digest();
}

// Verifier from pg_authid (just set via ALTER USER WITH PASSWORD 'postgres'):
const verifier = "SCRAM-SHA-256$4096:UuH8tluhC6MeNlZMNPHvbw==$5iDz/qAnkwnGB3u9ZGH8vk7WpU7NSXSJ4GGCADIio0g=:jvB398wBk0jri291n7ZBNGMNWLVOzn0D4sinhvll5E4=";
const parts = verifier.split("$");
// parts[0] = "SCRAM-SHA-256"
// parts[1] = "4096:UuH8tluhC6MeNlZMNPHvbw=="
// parts[2] = "5iDz/...=:jvB3...="
const [iterStr, saltB64] = parts[1].split(":");
const storedKeyB64 = parts[2].split(":")[0];
const serverKeyB64 = parts[2].split(":")[1];

const salt = Buffer.from(saltB64, "base64");
const iterations = parseInt(iterStr, 10);
const storedKeyFromDB = Buffer.from(storedKeyB64, "base64");
const serverKeyFromDB = Buffer.from(serverKeyB64, "base64");

console.log("Verifier salt:          ", saltB64);
console.log("Iterations:             ", iterations);
console.log("StoredKey from DB (hex):", storedKeyFromDB.toString("hex"));
console.log("ServerKey from DB (hex):", serverKeyFromDB.toString("hex"));

// Compute expected values for password "postgres"
const saltedPwd = crypto.pbkdf2Sync("postgres", salt, iterations, 32, "sha256");
const clientKey = hmac(saltedPwd, "Client Key");
const computedStoredKey = sha256(clientKey);
const computedServerKey = hmac(saltedPwd, "Server Key");

console.log("\nComputed StoredKey (hex):", computedStoredKey.toString("hex"));
console.log("Computed ServerKey (hex):", computedServerKey.toString("hex"));
console.log("\nStoredKey match:", computedStoredKey.toString("hex") === storedKeyFromDB.toString("hex"));
console.log("ServerKey match:", computedServerKey.toString("hex") === serverKeyFromDB.toString("hex"));
