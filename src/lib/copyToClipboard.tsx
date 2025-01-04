"use client";

// Method to copy to clipboard
export const copyToClipboard = (toCopy: string) => {
  navigator.clipboard.writeText(toCopy);
};
