import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";
import { wss } from "./websocket/server";
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(
    `${new Date().toLocaleString()} - Received ${req.method} request for ${
      req.url
    } with data -> ${JSON.stringify(req.body)}`
  );
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Rotas
app.use("/items", itemRoutes);
app.use("/auth", authRoutes);

// Creation of the HTTP server
const server = http.createServer(app);

// Integrate WebSocket with the HTTP server
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
