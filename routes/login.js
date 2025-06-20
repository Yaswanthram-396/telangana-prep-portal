const express = require('express');
const clientPromise = require('../clientpro/index.js');
const jwt = require("jsonwebtoken");


const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

router.post('/login', async(req, res) => {
    const { userName, password } = await req.body;

    try {
      const client = await clientPromise;
      const db = client.db("telangana");
      const usersCollection = db.collection("user"); // Fix: Define usersCollection
  console.log(userName, password);
      // Check if user exists
      let user = await usersCollection.findOne({ userName });
      const date = new Date();
      if (!user) {
        // Create a new user
        await usersCollection.insertOne({ userName, password,date });
        user = await usersCollection.findOne({ userName }); // Fetch newly created user
      } else if (user.password !== password) {
        return res.json(
          { message: "Invalid userName or password" },
          { status: 401 }
        );
      }
  
      // Generate JWT token
      const token = jwt.sign({ userName }, SECRET_KEY, { expiresIn: "1h" });
  
      return res.json(
        { message: "Login successful", token },
        { status: 200 }
      );
    } catch (error) {
      return res.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
})
router.get('/user', async(req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    console.log(authHeader);
    try {

    const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, SECRET_KEY);
      console.log("decodedToken", decodedToken);
      const userName = decodedToken.userName;
      const client = await clientPromise;

      const db = client.db("telangana");
      const usersCollection = db.collection("user");
      const user= await usersCollection.findOne({ userName }); // Fetch newly created user
      console.log("user", user);
      if (!user) {
        return res.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

  
      res.json({ name: user.userName, date: user.date });
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  
})
module.exports = router;