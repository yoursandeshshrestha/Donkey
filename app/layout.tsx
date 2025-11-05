import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutClient } from "./components/others/LayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Glowshot",
  description:
    "Glowshot is a platform to turn boring images into professional ones",
  icons: {
    icon: "/hero/example-image.jpg",
    shortcut: "/hero/example-image.jpg",
    apple: "/hero/example-image.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
