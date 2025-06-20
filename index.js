require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const loginRouts = require('./routes/login');
const askai=require('./routes/askai');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use("/api", loginRouts);
app.use("/api/ask-ai",askai);
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Sample route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Example: use routes
// const userRoutes = require('./routes/users');
// app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
