const express = require('express');
const { getTimeSpent, saveTimeSpent, getAllTimeSpent } = require('../controllers/timeController');

const router = express.Router();

// Get time spent for a specific user and book
router.get('/:userId/:bookId', getTimeSpent);

// Save or update time spent
router.post('/:userId/:bookId', saveTimeSpent);

// Get all time spent data
router.get('/', getAllTimeSpent);

module.exports = router;
