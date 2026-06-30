// Test using Node.js's built-in net module to see what happens at the TCP level
import net from "net";

const socket = net.createConnection({ host: "127.0.0.1", port: 5432 }, () => {
  console.log("✅ TCP connection established to 127.0.0.1:5432");

  // Send PostgreSQL startup message (protocol 3.0)
  const user = "postgres";
  const database = "khalvat";
  const params = `user\0${user}\0database\0${database}\0\0`;
  const len = 4 + 4 + params.length;
  const buf = Buffer.alloc(len);
  buf.writeInt32BE(len, 0);
  buf.writeInt32BE(196608, 4); // protocol 3.0
  buf.write(params, 8);
  socket.write(buf);
});

socket.on("data", (d) => {
  const type = String.fromCharCode(d[0]);
  console.log("Received message type:", type, "| hex:", d.slice(0, 20).toString("hex"));
  socket.destroy();
});

socket.on("error", (e) => console.error("TCP error:", e.message));
socket.setTimeout(5000, () => { console.error("Timeout"); socket.destroy(); });
