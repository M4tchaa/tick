import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tick - Countdown Timer",
  description: "Countdown timer for Event Organizers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
