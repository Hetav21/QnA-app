import React from "react";

// To display multi line messages
export const displayMessage = (text: string) => {
  if (!text) return null;
  try {
    return JSON.parse(text)
      .split("\n")
      .map((line: string, index: number) => (
        <div key={index}>
          {line}
          {index < text.split("\n").length - 1 && <br />}
        </div>
      ));
  } catch (err) {
    console.error(err);
    return text;
  }
};
