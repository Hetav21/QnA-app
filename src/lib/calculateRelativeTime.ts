export function calculateTime(date: Date): string {
  // Calculating the time spent since message creation
  const dateTimeRightNow = new Date();
  const createdAt = new Date(date);
  const timeSpent = Math.floor(
    (dateTimeRightNow.getTime() - createdAt.getTime()) / (1000 * 60),
  );

  let t;

  const time =
    timeSpent > 24 * 60
      ? `${(t = Math.floor(timeSpent / (24 * 60)))} day${t === 1 ? "" : "s"} ago`
      : Math.floor(timeSpent / 60) === 0
        ? `${timeSpent} minute${timeSpent === 1 ? "" : "s"} ago`
        : `${(t = Math.floor(timeSpent / 60))} hour${t === 1 ? "" : "s"} ago`;

  return time;
}
