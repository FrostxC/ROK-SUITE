import type { Metadata } from "next";
import { Inter, Cinzel, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { PlayerDrawerProvider } from "@/lib/roster/player-drawer-context";
import { PlayerDetailDrawer } from "@/components/roster/PlayerDetailDrawer";
import { LocaleAutoDetect } from "@/components/LocaleAutoDetect";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { rtlLocales, type Locale } from '@/lib/i18n/config';

// Body font — clean geometric sans, mapped onto the existing sans variable so
// every page inherits it without further changes.
const bodySans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display font — sharp authoritative serif for kingdom name, headings, titles.
const displaySerif = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANGMAR - Kingdom 23 - RoK",
  description: "Angmar Nazgul Guards - Rise of Kingdoms Kingdom 23 alliance tools and battle planning",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as Locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.className = theme;
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${bodySans.variable} ${displaySerif.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleAutoDetect />
          <ThemeProvider>
            <AuthProvider>
              <PlayerDrawerProvider>
                {children}
                <PlayerDetailDrawer />
              </PlayerDrawerProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
