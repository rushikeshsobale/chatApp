const express = require('express');
const app = express();
const cors = require("cors");

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

require("./Mongo/Conn.js");

// Set up router and other middleware
const router = require('./route/router');
app.use(router);

// Set up HTTP server
const http = require('http').createServer(app);

// Attach Socket.IO to the HTTP server
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

const activeMembers = new Map();

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ userId }) => {
        activeMembers.set(socket.id, userId);
        socket.join(userId);
        console.log(`User joined room ${socket.id}`);
    });

    socket.on('sendMessage', (data) => {
        const { message, userId, myId, sender } = data;
        try {
            io.to(userId).emit('message', { text: message, senderId: myId, senderName: sender });
        } catch (err) {
            console.error('Error sending message:', err.message);
        }
    });

    socket.on("new-user", (name) => {
        activeMembers.set(socket.id, name);
        io.emit("activeUsers", Array.from(activeMembers.values()));
    });

    socket.on('disconnect', () => {
        const name = activeMembers.get(socket.id);
        activeMembers.delete(socket.id);
        console.log(`User ${name} disconnected`);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});

// Handle server errors
http.on('error', (err) => {
    console.error('HTTP server error:', err.message);
});

const port = 5500;
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
