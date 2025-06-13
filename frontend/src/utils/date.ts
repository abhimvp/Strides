// Helper to format a Date object into "YYYY-MM-DD" string
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWeekDays = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const week: { day: string; date: number; fullDate: string; isToday: boolean; isPast: boolean }[] = [];
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const todayDateString = toISODateString(today);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + i);

    const fullDateString = toISODateString(date);

    week.push({
      day: dayLabels[i],
      date: date.getDate(),
      fullDate: fullDateString,
      isToday: fullDateString === todayDateString,
      isPast: date < today && fullDateString !== todayDateString,
    });
  }
  return week;
};