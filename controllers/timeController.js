const TimeSpent = require('../models/TimeSpent');

// Helper function to convert seconds into a readable format
const convertTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let formattedTime = '';
  if (hours > 0) formattedTime += `${hours}h `;
  if (remainingMinutes > 0) formattedTime += `${remainingMinutes}m `;
  if (remainingSeconds > 0) formattedTime += `${remainingSeconds}s`;

  return formattedTime.trim();
};

// Get time spent for a specific book and user
exports.getTimeSpent = async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    const userTime = await TimeSpent.findOne({ userId, bookId });
    if (userTime) {
      const formattedTime = convertTime(userTime.timeSpent);
      res.json({ timeSpent: formattedTime });
    } else {
      res.json({ timeSpent: '0m 0s' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving time spent', error });
  }
};

// Save or update time spent
exports.saveTimeSpent = async (req, res) => {
  const { userId, bookId } = req.params;
  let { timeSpent } = req.body;

  if (typeof timeSpent !== 'number' || timeSpent < 0) {
    return res.status(400).json({ message: 'Invalid time format. Time spent should be a positive number in seconds.' });
  }

  // Adjust the timer to be slower by dividing the received timeSpent
  timeSpent = Math.floor(timeSpent / 2);

  try {
    let userTime = await TimeSpent.findOne({ userId, bookId });

    if (userTime) {
      userTime.timeSpent += timeSpent;
    } else {
      userTime = new TimeSpent({ userId, bookId, timeSpent });
    }

    await userTime.save();
    const formattedTime = convertTime(userTime.timeSpent);
    res.json({ message: 'Time spent updated', timeSpent: formattedTime });
  } catch (error) {
    res.status(500).json({ message: 'Error saving time spent', error });
  }
};

// Get all time spent data
exports.getAllTimeSpent = async (req, res) => {
  try {
    const allTimeSpent = await TimeSpent.find();
    const formattedTimeSpent = allTimeSpent.map((user) => ({
      ...user._doc,
      timeSpent: convertTime(user.timeSpent),
    }));
    res.json(formattedTimeSpent);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all time spent data', error });
  }
};
