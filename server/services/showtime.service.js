import Showtime from "../models/ShowtimeModel.js";

export const checkTimeConflict = async (screenId, date, startTime, endTime) => {
  const existing = await Showtime.findOne({
    screen: screenId,
    showDate: date,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  });

  return existing || null;
};
