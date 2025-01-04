import { MessageProvider } from "@/context/MessageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Context to manage messages and methods to manage messages */}
      <MessageProvider>{children}</MessageProvider>
    </>
  );
}
