import net from "net";
import crypto from "crypto";

const HOST = "127.0.0.1";
const PORT = 5432;
// Test with a fresh user where there's no caching confusion
const USER = "testauth";
const PASSWORD = "testpass123";
const DATABASE = "khalvat";

function hmac(key, str) {
  return crypto.createHmac("sha256", key).update(str).digest();
}
function sha256(x) {
  return crypto.createHash("sha256").update(x).digest();
}
function xor(a, b) {
  const buf = Buffer.allocUnsafe(a.length);
  for (let i = 0; i < a.length; i++) buf[i] = a[i] ^ b[i];
  return buf;
}

const clientNonce = crypto.randomBytes(18).toString("base64");
const clientFirstBare = `n=*,r=${clientNonce}`;
const clientFirst = `n,,${clientFirstBare}`;

const socket = net.createConnection({ host: HOST, port: PORT });
let step = 0;
let buf = Buffer.alloc(0);

socket.on("connect", () => {
  console.log("✅ TCP connected");
  const startupParams = `user\0${USER}\0database\0${DATABASE}\0\0`;
  const totalLen = 8 + startupParams.length;
  const startup = Buffer.allocUnsafe(totalLen);
  startup.writeInt32BE(totalLen, 0);
  startup.writeInt32BE(196608, 4);
  startup.write(startupParams, 8);
  socket.write(startup);
  step = 1;
});

socket.on("data", (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  while (buf.length > 5) {
    const msgType = String.fromCharCode(buf[0]);
    const msgLen = buf.readInt32BE(1) + 1;
    if (buf.length < msgLen) break;
    const msg = buf.slice(0, msgLen);
    buf = buf.slice(msgLen);
    const authType = msgType === "R" ? msg.readInt32BE(5) : -1;

    if (step === 1) {
      if (msgType === "R" && authType === 10) {
        console.log("← AuthenticationSASL");
        const mechStr = "SCRAM-SHA-256\0";
        const cfBuf = Buffer.from(clientFirst, "utf8");
        const msgBody = Buffer.allocUnsafe(mechStr.length + 4 + cfBuf.length);
        msgBody.write(mechStr, 0);
        msgBody.writeInt32BE(cfBuf.length, mechStr.length);
        cfBuf.copy(msgBody, mechStr.length + 4);
        const hdr = Buffer.allocUnsafe(5);
        hdr[0] = 0x70;
        hdr.writeInt32BE(msgBody.length + 4, 1);
        socket.write(Buffer.concat([hdr, msgBody]));
        step = 2;
      } else if (msgType === "E") {
        console.error("← Error:", msg.slice(5).toString("utf8"));
        socket.destroy();
      }
    } else if (step === 2) {
      if (msgType === "R" && authType === 11) {
        const serverFirst = msg.slice(9).toString("utf8");
        console.log("← SASLContinue:", serverFirst);
        const parts = {};
        serverFirst.split(",").forEach((p) => { parts[p[0]] = p.slice(2); });

        const salt = Buffer.from(parts.s, "base64");
        const iterations = parseInt(parts.i, 10);
        console.log("  salt:", parts.s, "iterations:", iterations);

        const saltedPassword = crypto.pbkdf2Sync(PASSWORD, salt, iterations, 32, "sha256");
        const clientKey = hmac(saltedPassword, "Client Key");
        const storedKey = sha256(clientKey);
        const serverKey = hmac(saltedPassword, "Server Key");
        const clientFinalNoProof = `c=biws,r=${parts.r}`;
        const authMessage = `${clientFirstBare},${serverFirst},${clientFinalNoProof}`;
        const clientSignature = hmac(storedKey, authMessage);
        const clientProof = xor(clientKey, clientSignature);
        const serverSignature = hmac(serverKey, authMessage).toString("base64");
        const clientFinal = `${clientFinalNoProof},p=${clientProof.toString("base64")}`;
        const cfBuf = Buffer.from(clientFinal, "utf8");
        const hdr = Buffer.allocUnsafe(5);
        hdr[0] = 0x70;
        hdr.writeInt32BE(cfBuf.length + 4, 1);
        socket.write(Buffer.concat([hdr, cfBuf]));
        socket._serverSig = serverSignature;
        step = 3;
      } else if (msgType === "E") {
        console.error("← Error:", msg.slice(5).toString("utf8"));
        socket.destroy();
      }
    } else if (step === 3) {
      if (msgType === "R" && authType === 12) {
        const serverFinal = msg.slice(9).toString("utf8");
        console.log("← SASLFinal:", serverFinal);
        if (serverFinal.replace("v=", "") === socket._serverSig) {
          console.log("✅ Server signature OK — authentication SUCCEEDS at protocol level");
        } else {
          console.error("❌ Server signature mismatch");
        }
        socket.destroy();
      } else if (msgType === "R" && authType === 0) {
        console.log("✅ Authentication OK!");
        socket.destroy();
      } else if (msgType === "E") {
        const errStr = msg.slice(5).toString("utf8");
        console.error("❌ Auth FAILED:", errStr);
        socket.destroy();
      }
    }
  }
});

socket.on("error", (e) => console.error("Socket error:", e.message));
socket.setTimeout(8000, () => { console.error("Timeout"); socket.destroy(); });
