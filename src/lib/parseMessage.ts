// To parse multi line messages
export const parseMessage = (message: string) => {
  try {
    return JSON.parse(message);
  } catch (err) {
    console.error(err);
    return message;
  }
};
