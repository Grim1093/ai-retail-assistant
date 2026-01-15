// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Define the POST route for chat
// This maps to: http://localhost:5000/api/chat
router.post('/', chatController.handleChat);

module.exports = router;