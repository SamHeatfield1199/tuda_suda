import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ConfigProvider, ThemeConfig} from "antd";
import Toast from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appTheme: ThemeConfig = {
  token: {
    green: '#49CC2F',
    purple: '#6813DF',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider theme={appTheme}>
          {children}
          <Toast />
        </ConfigProvider>
      </body>
    </html>
  );
}
