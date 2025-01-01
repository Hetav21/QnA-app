// Sanitize response from server to ensure a valid string format
// Converts input to string
export function sanitizeString(input: unknown): string {
  try {
    if (typeof input === "string") {
      // Convert single-quoted strings to double-quoted strings
      return input.startsWith("'") && input.endsWith("'")
        ? `"${input.slice(1, -1)}"`
        : input;
    }
    return String(input);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log("Caught a SyntaxError, attempting to convert to string.");
      return String(input); // Fallback to string conversion
    } else {
      console.log("Unexpected error:", error);
      return "Error";
    }
  }
}
