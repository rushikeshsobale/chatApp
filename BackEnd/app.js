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

// Define a global array to store messages and active users
let messages = [];
let activeMembers = [];

io.on("connection", (socket) => {    
    socket.on("joinRoom", ({ userId, sendid }) => {
        socket.join(userId); // Current user joins the room
      //  socket.join(sendid); // Specific friend joins the room
        console.log(`User ${socket.id} joined room ${userId}`);
    });
    
         
    socket.on('sendMessage', (data) => {
        const { message, userId, sender, myId } = data;
        console.log(data, "data")
        console.log(`Received message from ${socket.id} to room ${userId}: ${message}`);
        try{
            io.to(userId).emit('message', { text: message, sender:sender, neededId:myId });
        }
       catch(err){
           console.log(err)
       }
    }); 
    
    socket.on("new-user", (name) => {
        activeMembers.push(name);
        io.emit("activeUsers", activeMembers);
    });

   // socket.on('disconnect', () => {        
     //   console.log(`User ${socket.id} disconnected ${socket.name}`);
       // activeMembers = activeMembers.filter(member => member.name !== socket.name);
        //io.emit('userLeft', socket.id);
        //io.emit('activeUsers', activeMembers);
    //});
                                                                         
    socket.on('error', (err) => {           
        console.error('Socket error:', err.message);
    });
});

// Handle server errors
http.on('error', (err) => {
    console.error('HTTP server error:', err.message);
    // You can choose to handle the error further or take any necessary actions here
});

// Start the server
const port = 5500;
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
