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
    const x=await Muser.findOne({_id:req.decoded.userId}).populate("friends2")
    const user = await Muser.findById(req.decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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

    const { email, password, firstName, lastName, birthdate, phone } = req.body;

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

router.post("/sendRequest/:receiverId", verifyToken, async (req, res) => {
  try {
    const senderId = req.decoded.userId;
    const senderName = req.decoded.name;
    const receiverId = req.params.receiverId;
    const receiver = await Muser.findById(receiverId);
    const sender = await Muser.findById(senderId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }
    const alreadyFriends = sender.friends.find(friend => friend.friendId === receiverId);
    if (alreadyFriends) {
      return res.status(400).json({ message: 'You are already friends' });
    }

    await Muser.findByIdAndUpdate(senderId, {
      $push: {
        friends: {
          friendId: receiverId,
          friendName: receiver.firstName,
          isFriend: false,

        }
      }
    });
    await Muser.findByIdAndUpdate(receiverId, {
      $push: {
        friends: {
          friendId: senderId,
          friendName: sender.firstName,
          isFriend: false,

        }
      }
    });

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




router.post("/acceptFriendRequest/:requesterId", verifyToken, async (req, res) => {
  try {
    const userId = req.decoded.userId; // The user accepting the request
    const requesterId = req.params.requesterId; // The user who sent the request
    console.log(userId, 'userId', requesterId)
    // Find both users
    const user = await Muser.findById(userId);
    const requester = await Muser.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingRequestIndex = user.friends.findIndex(request => request.friendId === requesterId);
    if (existingRequestIndex === -1) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }
    await Muser.findByIdAndUpdate(userId, {
      $set: {
        "friends.$[elem].isFriend": true // Update isFriend to true for the requester
      }
    }, {
      arrayFilters: [{ "elem.friendId": requesterId }], // Match the requester in the friends array
      new: true
    });

    await Muser.findByIdAndUpdate(requesterId, {
      $set: {
        "friends.$[elem].isFriend": true // Update isFriend to true for the user
      }
    }, {
      arrayFilters: [{ "elem.friendId": userId }], // Match the user in the friends array
      new: true
    });

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/sendMessage', async (req, res) => {
  const { sendId, message } = req.body;
  console.log(message);
  const { text, senderId, senderName, status } = message;

  const newMessageForSender = {
    text,
    senderId,
    senderName,
    sentByCurrentUser: true,
    status,
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



router.delete("/deleteRequest/:requesterId", verifyToken, async (req, res) => {
  try {
    const userId = req.decoded.userId; // The user who wants to delete the request
    const requesterId = req.params.requesterId; // The user who sent the request

    // Find the user and check for existing request
    const user = await Muser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if there is a pending friend request from the requester
    const existingRequestIndex = user.friendRequests.findIndex(request => request.senderId.toString() === requesterId);
    if (existingRequestIndex === -1) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }
    user.friendRequests.splice(existingRequestIndex, 1);
    await Muser.findByIdAndUpdate(userId, { friendRequests: user.friendRequests }, { new: true });
    res.status(200).json({ message: 'Friend request deleted successfully', user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
router.get('/getMessages/:userId', async (req, res) => {
  const { userId } = req.params;
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
router.post('/updateMessageStatus', async (req, res) => {
  const { userId, messageId, status } = req.body;
  try {
      const user = await Muser.findById(userId);
      if (!user) {
          return res.status(404).send('User not found');
      }
      const messages = user.messages[messageId];
      if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          lastMessage.status = status;
          await Muser.findByIdAndUpdate(
              userId,
              { [`messages.${messageId}.${messages.length - 1}.status`]: status },
              { new: true } 
          );
          return res.status(200).send('Last message status updated successfully');
      } else {
          return res.status(404).send('No messages found for this sender');
      }
  } catch (error) {
      console.error(error);
      return res.status(500).send('Server error');
  }
});
router.post('/deleteChat', async (req, res) => {
  const { userId, messageId } = req.body;
 
  try {
      // Find the user and clear the messages for the specified messageId
      const updatedUser = await Muser.findOneAndUpdate(
          { _id: userId },
          { $set: { [`messages.${messageId}`]: [] } },
          { new: true } // Return the updated document
      );

      // Check if user was found
      if (!updatedUser) {
          return res.status(404).send('User not found');
      }

      // Check if messages were actually cleared
      if (!updatedUser.messages[messageId]) {
          return res.status(404).send('No messages found for this sender');
      }

      return res.status(200).send('Chat cleared successfully');
  } catch (error) {
      console.error(error);
      return res.status(500).send('Server error');
  }
});


module.exports = router;