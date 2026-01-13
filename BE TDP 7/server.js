require("dotenv").config(); // luôn ở trên cùng

const app = require("./src/app");
const { connectDB, closePool } = require("./src/config/dbConfig");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect database
    await connectDB();

    // 2. Start server
    const server = app.listen(PORT, () => {
      console.log("\n===================================================");
      console.log(`✅ Server started on port ${PORT}`);
      console.log(`✅ Database connected`);
      console.log(`📂 Backend ready`);
      console.log("===================================================\n");
    });

    // 3. Server error
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", err);
      }
      process.exit(1);
    });

    // 4. Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down...`);

      server.close(async () => {
        console.log("✅ HTTP server closed");
        await closePool();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
