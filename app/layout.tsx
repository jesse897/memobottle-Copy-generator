import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copy Generator — memobottle",
  description: "On-brand copy generation for the memobottle marketing team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
