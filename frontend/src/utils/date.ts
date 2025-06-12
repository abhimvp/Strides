export const getWeekDays = () => {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const todayIndex = new Date().getDay();
  const reorderedDays = [];
  for (let i = 7; i > 0; i--) {
    reorderedDays.push(days[(todayIndex - i + 1 + 7) % 7]);
  }
  return reorderedDays;
};
