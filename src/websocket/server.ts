import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, request) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  if (url.pathname !== "/websocket") {
    ws.close(4000, "Invalid endpoint");
    return;
  }

  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

export { server, wss };
