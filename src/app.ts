import express from "express";

async function bootstrap() {
  console.log(`clean slate`);
}

// Call the bootstrap function to run the server
bootstrap().catch((error) => {
  console.error("Error starting server:", error);
});
