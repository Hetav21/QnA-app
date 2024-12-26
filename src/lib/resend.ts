import { Resend } from "resend";

// Connecting to resend client
export const resend = new Resend(process.env.RESEND_API_KEY);
