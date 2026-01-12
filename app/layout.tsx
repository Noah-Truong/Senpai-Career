import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}

