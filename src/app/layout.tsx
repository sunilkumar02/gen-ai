import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aster — your personal AI workspace",
  description: "A thoughtful space to think, create, and get things done.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
