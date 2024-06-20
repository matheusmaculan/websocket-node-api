import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import Item from "../models/item";
import { wss } from "../websocket/server";

const router = express.Router();

// Create a new item
router.post("/", authMiddleware, async (req, res) => {
  const item = new Item(req.body);

  try {
    if (!item.codeBar) {
      return res.status(400).send({ error: "The codeBar field is missing." });
    }

    await item.save();

    res.status(201).send(item);
    // Enviar mensagem via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: "itemRegister", data: item }));
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all items
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single item by id
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).send();
    }

    if (!item.codeBar) {
      return res.status(400).send({ error: "The codeBar field is missing." });
    }

    res.send(item);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update an item by id
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).send();
    }
    // Send message via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: "itemUpdated", data: item }));
      }
    });

    res.send(item);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete an item by id
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).send();
    }
    // Send message via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: "itemRemoved", data: item }));
      }
    });
    res.send(item);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
