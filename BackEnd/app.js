const express = require('express');
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());
require("./Mongo/Conn.js")
// Set up CORS middleware
// Set up OPTIONS route handler for preflight requests to /socket.io/
app.options('/socket.io/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});
// Set up router and other middleware
const router = require('./route/router');
app.use(router);
// Set up HTTP server
const http = require('http').createServer(app);
// Attach Socket.IO to the HTTP server with error handling
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

let activeMembers =[]

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ userId }) => {
        activeMembers.push(userId)
        socket.join(userId);
        console.log(`User joined room ${socket.id}`);

    });
    socket.on('sendMessage', (data) => {
        console.log('data',data)
        const { message, userId, myId, sender } = data;
        
        try {
            io.to(userId).emit('message', { text: message, senderId: myId, senderName:sender});
        } catch (err) {
            console.error('Error sending message:', err.message);
        }
    });
    socket.on("new-user", (name) => {
        activeMembers.set(socket.id, name);
        io.emit("activeUsers", Array.from(activeMembers.values()));
        console.log('Active members:', Array.from(activeMembers.values()));
    });
    socket.on('disconnect', () => {
        // const name = activeMembers.get(socket.id);
        // activeMembers.delete(socket.id);
        console.log(`User ${socket.id} disconnected`);
    });
    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});


// Handle server errors
http.on('error', (err) => {
    console.error('HTTP server error:', err.message);
    // You can choose to handle the error further or take any necessary actions here
});

const port = 5500;
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
