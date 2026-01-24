import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Senpai Career - 留学生の就活にフェアなスタートラインを",
  description: "Membership-based platform for international students in Japan",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}

