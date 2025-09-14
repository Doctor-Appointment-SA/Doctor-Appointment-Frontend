import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/authen/auth";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
});

export const metadata: Metadata = {
  title: "SA Doctor App",
  description: "Doctor appointment & prescription portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={notoSansThai.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
