export const getWeekDays = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIndex = new Date().getDay(); // Gets the day of the week, using local time.
  console.log("Today Index:", todayIndex); // Debugging line
  const reorderedDays = [];
  for (let i = 7; i > 0; i--) {
    reorderedDays.push(days[(todayIndex - i + 7) % 7]);
  }
  return reorderedDays;
};
