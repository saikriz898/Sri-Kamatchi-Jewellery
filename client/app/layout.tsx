import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif_Tamil, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoTamil = Noto_Serif_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  weight: ["400", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});


export const metadata: Metadata = {
  title: "ஸ்ரீ காமாட்சி நகை நிலையம்",
  description: "Sri Kamatchi Jewellery - Daily Rate Poster Studio",
  manifest: "/manifest.json",
  icons: {
    icon: "/Logo_top.png",
    apple: "/Logo_top.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sri Kamatchi",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050402",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoTamil.variable} ${cinzel.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="h-screen overflow-hidden flex flex-col bg-[#050402] text-[#e5d5c5]">
        {children}
      </body>
    </html>
  );
}
