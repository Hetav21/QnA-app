"use client";
// Sends an array of n random numbers to the caller
export function getRandomNumbers(
  n: number,
  rangeStart: number,
  rangeEnd: number,
): number[] {
  const res: number[] = [];

  while (res.length < n) {
    const randomValue =
      Math.floor(Math.random() * (rangeEnd - rangeStart - 1)) + rangeStart;
    res.push(randomValue);
  }

  return res;
}
