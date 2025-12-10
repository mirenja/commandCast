export async function sendCommand(conn, command) {
  return new Promise((resolve, reject) => {
    let output = "";
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);

      stream.on("close", () => resolve(output));
      stream.on("data", (data) => (output += data.toString()));
      stream.stderr.on("data", (data) => (output += data.toString()));
    });
  });
}
