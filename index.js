// socketServer/index.js (socketServer)
import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";
// import { type } from "os";

dotenv.config();
const app = express();

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
    }
    await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, {userId, location});
  });

  socket.on("disconnect", (socket) => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// src/lib/socket.ts
// user.model.ts file write "socketId & isOnline"
// app/api/socket/connect/route.ts
// modify components/HeroSection.tsx
// create an api in nextJs project for this update location  app/api/socket/connect/update-location/route.ts




