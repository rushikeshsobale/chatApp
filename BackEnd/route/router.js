// router.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Muser = require("../Modules/Muser.js");
const cookieParser = require("cookie-parser");
const verifyToken = require('./verifyToken'); // Import the JWT middleware
const secretKey = process.env.JWT_SECRET || "mySecreateKey";
router.use(cookieParser());

router.get("/", (req, res) => {
  res.send("Alright");
});

router.get("/getUsers", verifyToken, async (req, res) => {
  try {
    const users = await Muser.find(); // Retrieve all users
    const filteredUsers = users.filter(user => user._id.toString() !== req.decoded.userId);

    res.json(filteredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/getUser", verifyToken, async (req, res) => {
  try {
    // Extract token from cookies


    // Retrieve user data based on userId
    const user = await Muser.findById(req.decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user data in response
    res.json(user);
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/register", async (req, res) => {
  try {
    // Extract user data from request body
    const { email, password, firstName, lastName, birthdate, phone, username } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    const newUser = new Muser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      birthdate,
      phone,
      requests: [], // Initialize friends as an empty array
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Respond with the saved user data
    res.status(201).json(savedUser);
  } catch (error) {
    // Handle errors
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;


  try {
    const validateEmail = await Muser.findOne({ email: email });
    if (validateEmail) {
      const validatePassword = await bcrypt.compare(
        password,
        validateEmail.password
      );

      if (validatePassword) {
        const token = jwt.sign(
          { userId: validateEmail._id, email: validateEmail.email, name: validateEmail.firstName, requests: validateEmail.requests, friends: validateEmail.friends },
          secretKey,
          { expiresIn: "3560d" }
        );
        res.cookie("token", token, { httpOnly: true, sameSite: "strict" });

        res.status(200).json({ message: "Successfully logged in", token });


      } else {
        res.status(400).send("Password does not match");
      }
    }
    else {
      res.status(400).send("user with this account does not exist.")
    }
  }
  catch (error) {
    console.log("something went wrong for login")
  }
});

router.post("/sendRequest/:userId", verifyToken, async (req, res) => {
  try {
    const sender = [req.decoded.userId, req.decoded.name, false];
    const userId = req.params.userId;

    const user = await Muser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const existingRequest = user.requests.find(request => request[0] === req.decoded.userId);
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent to this user' });
    }
    user.requests.push(sender);

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Request sent successfully', user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post("/acceptFriendRequest/:requestId", async (req, res) => {
  try {
    const token = req.cookies.token;
    const reqId = req.params.requestId;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mySecreateKey");
    const response = await Muser.findById(reqId);
    const abc = await Muser.findById(decoded.userId);
    const data = [decoded.userId, decoded.name, abc.lastName];
    const fname = response.firstName;
    const lname = response.lastName;
    const array = [reqId, fname, lname];

    if (response) {
      response.friends.push(data);
      await response.save();
    }
    if (abc) {
      abc.friends.push(array);
      await abc.save();
      for (let i = 0; i < abc.requests.length; i++) {
        if (abc.requests[i][0] == reqId) {
          abc.requests.splice(i, 1); // Delete abc.requests[i]
          await abc.save();
          break; // Exit loop since the element is deleted
        }
      }
    }
    res.status(200).json({ message: "Request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post('/sendMessage', async (req, res) => {
  const { sendId, message } = req.body;
  console.log(message);
  const { text, senderId, senderName } = message;

  const newMessageForSender = {
    text,
    senderId,
    senderName,
    sentByCurrentUser: true, // Set to true for sender
    timestamp: new Date(),
  };

  const newMessageForReceiver = {
    text,
    senderId,
    senderName,
    sentByCurrentUser: false, // Set to false for receiver
    timestamp: new Date(),
  };

  try {
    const user = await Muser.findById(senderId);
    const receiver = await Muser.findById(sendId);

    if (user) {
      // Logic for sender
      if (!user.messages) {
        user.messages = {};
      }
      if (!user.messages[sendId]) {
        user.messages[sendId] = [];
      }
      user.messages[sendId].push(newMessageForSender);

      // Save message to sender
      await Muser.findByIdAndUpdate(
        { _id: senderId },
        { messages: user.messages },
        { upsert: true }
      );

      // Logic for receiver
      if (!receiver.messages) {
        receiver.messages = {};
      }
      if (!receiver.messages[senderId]) {
        receiver.messages[senderId] = [];
      }
      receiver.messages[senderId].push(newMessageForReceiver);

      // Save message to receiver
      await Muser.findByIdAndUpdate(
        { _id: sendId },
        { messages: receiver.messages },
        { upsert: true }
      );

      res.status(200).json({ message: 'Message sent!' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/:userId/messages', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Muser.findById(userId).select('messages');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add this to your existing router
router.get('/getMessages/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log("this got called", userId)
  try {
    const user = await Muser.findById(userId);
 
    if (user) {
      res.status(200).json(user.messages || {});
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;