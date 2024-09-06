const express = require('express');
const TimeSpent = require('../models/TimeSpent');

const router = express.Router();

// Helper function to convert seconds into a readable format (hours and minutes)
const convertTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let formattedTime = '';
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (remainingMinutes > 0) {
    formattedTime += `${remainingMinutes}m `;
  }
  if (remainingSeconds > 0) {
    formattedTime += `${remainingSeconds}s`;
  }
  return formattedTime.trim();
};

// Get the time spent reading a specific book for a specific user
router.get('/:userId/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    const userTime = await TimeSpent.findOne({ userId, bookId });
    if (userTime) {
      const formattedTime = convertTime(userTime.timeSpent); // Convert time from seconds to a readable format
      res.json({ timeSpent: formattedTime });
    } else {
      res.json({ timeSpent: '0m 0s' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving time spent', error });
  }
});

// Save the time spent reading a specific book for a specific user
router.post('/:userId/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;
  let { timeSpent } = req.body; // Expecting time in seconds
  console.log('Received timeSpent (in seconds):', timeSpent);

  if (typeof timeSpent !== 'number' || timeSpent < 0) {
    return res.status(400).json({ message: 'Invalid time format. Time spent should be a positive number in seconds.' });
  }

  // Adjust the timer to be slower by dividing the received timeSpent
  timeSpent = Math.floor(timeSpent / 2);  // Adjust the factor as needed to control the speed
  console.log('Adjusted timeSpent (slower):', timeSpent);

  try {
    let userTime = await TimeSpent.findOne({ userId, bookId });

    if (userTime) {
      userTime.timeSpent += timeSpent; // Add new time to the existing time
    } else {
      userTime = new TimeSpent({ userId, bookId, timeSpent });
    }

    await userTime.save();
    const formattedTime = convertTime(userTime.timeSpent); // Convert to a readable format
    res.json({ message: 'Time spent updated', timeSpent: formattedTime });
  } catch (error) {
    res.status(500).json({ message: 'Error saving time spent', error });
  }
});

// Get all time spent data for all users and books
router.get('/', async (req, res) => {
  try {
    const allTimeSpent = await TimeSpent.find();
    // Convert each user's timeSpent from seconds to a readable format
    const formattedTimeSpent = allTimeSpent.map(user => ({
      ...user._doc,
      timeSpent: convertTime(user.timeSpent)
    }));
    res.json(formattedTimeSpent);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all time spent data', error });
  }
});

module.exports = router;
