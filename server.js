require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const app = express();

connectDB();

app.use(express.json());

app.use("/api", userRoutes);

const desiredPort = parseInt(process.env.PORT, 10);
const startPort = Number.isInteger(desiredPort) && desiredPort > 0 ? desiredPort : 0; // 0 => ephemeral
const MAX_PORT_TRIES = 10;

function startServer(port, attempts = 0) {
  const server = app.listen(port, () => {
    const actual = server.address() && server.address().port;
    console.log(`Server running on port ${actual}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempts >= MAX_PORT_TRIES) {
        console.error(`Port ${port} in use — reached max retries (${MAX_PORT_TRIES}). Exiting.`);
        process.exit(1);
      }
      const nextPort = port === 0 ? 0 : port + 1;
      console.warn(`Port ${port} in use, trying ${nextPort} (attempt ${attempts + 1})`);
      setTimeout(() => startServer(nextPort, attempts + 1), 200);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(startPort);
