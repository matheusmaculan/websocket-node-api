import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { wss } from "../websocket/server"; // Importar WebSocket Server

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifique se o usuário já existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ error: "Username already exists" });
    }

    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    res.status(201).send({ user, token });

    // Enviar mensagem via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: "userRegistered", data: user }));
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: "Invalid login credentials" });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.send({ user, token });

    // Enviar mensagem via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: "userLoggedIn", data: user }));
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
