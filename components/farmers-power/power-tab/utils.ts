import { FP_TIME } from "@/lib/game-constants";

// Helper function to get day name from DAYS_OF_WEEK
export const getDayName = (day: number): string => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[day];
};

// Helper function to calculate the next Farmers Power start date
export const getNextFarmersPowerStartDate = (): Date => {
  const now = new Date();
  const currentDayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  // Calculate days until next start day
  let daysUntilStart = (FP_TIME.START_DAY - currentDayOfWeek + 7) % 7;

  // If it's the start day, check if start time has passed
  if (daysUntilStart === 0) {
    // If start time hasn't passed yet today, set days to 0
    if (
      currentHour < FP_TIME.START_HOUR ||
      (currentHour === FP_TIME.START_HOUR &&
        currentMinute < FP_TIME.START_MINUTE)
    ) {
      daysUntilStart = 0;
    } else {
      // If start time has passed, set to next week
      daysUntilStart = 7;
    }
  }

  // Create the next start date
  const nextStartDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilStart,
      FP_TIME.START_HOUR,
      FP_TIME.START_MINUTE,
      0
    )
  );

  return nextStartDate;
};

// Helper function to format the end time for display
export const formatEndTimeDisplay = (): string => {
  return `${getDayName(FP_TIME.END_DAY)} ${new Date(
    0,
    0,
    0,
    FP_TIME.END_HOUR,
    FP_TIME.END_MINUTE
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} UTC`;
};
