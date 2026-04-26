// socketServer/index.js (socketServer)
import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";
// import { type } from "os";

dotenv.config();
const app = express();

app.use(express.json()); // for parsing application/json
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  let userId = null;

  socket.on("identity", async (id) => {
    userId = id;
    // console.log(`User connect: ${userId}`);

    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, {
      userId,
      socketId: socket.id,
    });
  });

  // update location
  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    io.emit("update-deliveryBoy-location", { userId, location });

    await axios.post(
      `${process.env.NEXT_BASE_URL}/api/socket/update-location`,
      { userId, location },
    );
  });

  // message room
  socket.on("join-room", (roomId) => {
    console.log(`User join room: ${roomId}`);
    socket.join(roomId);
  });
  socket.on("send-message", async (message) => {
    console.log(message);
    await axios.post(`${process.env.NEXT_BASE_URL}/api/chat/save`, message);
    io.to(message.roomId).emit("send-message", message);
  });

  socket.on("disconnect", (socket) => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// common api
app.post("/notify", (req, res) => {
  const { event, data, socketId } = req.body;
  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    io.emit(event, data);
  }
  return res.status(200).json({ success: true });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// src/lib/socket.ts
// user.model.ts file write "socketId & isOnline"
// app/api/socket/connect/route.ts
// modify components/HeroSection.tsx
// create an api in nextJs project for this update location  app/api/socket/connect/update-location/route.ts
