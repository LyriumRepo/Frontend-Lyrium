import type { Metadata } from 'next';
import { Geist, Geist_Mono, DM_Serif_Display, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { NotificationProvider } from '@/shared/lib/context/NotificationContext';
import NotificationToast from '@/components/shared/notifications/NotificationToast';
import { AuthProvider } from '@/shared/lib/context/AuthContext';
import { ToastProvider } from '@/shared/lib/context/ToastContext';
import { EchoProvider } from '@/shared/lib/providers/EchoProvider';
import { ThemeProvider } from 'next-themes';
import QueryProvider from '@/components/providers/QueryProvider';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';
import CartProviders from '@/components/CartProviders';
import { PageTransitionLoader } from '@/components/layout/shared/PageTransitionLoader';
import { TopMedalProvider } from '@/shared/lib/context/TopMedalContext';

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bienvenido al Lyrium Marketplace',
  description: 'Tu marketplace de confianza',
};

const IZIPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY ?? '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css"
        />
      </head>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${dmSerif.variable}
          ${dmSans.variable}
          antialiased bg-white dark:bg-[var(--bg-primary)]
        `}
      >
        <Script
          src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
          kr-public-key={IZIPAY_PUBLIC_KEY}
          kr-language="es-ES"
          kr-post-url-success=""
        />

        <Script
          src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js"
          strategy="afterInteractive"
        />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <GoogleOAuthWrapper>
              <AuthProvider>
                <EchoProvider>
                  <NotificationProvider>
                    <ToastProvider>
                      <NotificationToast />
                      <TopMedalProvider>
                        {children}
                      </TopMedalProvider>
                      <PageTransitionLoader />
                      <CartProviders />
                    </ToastProvider>
                  </NotificationProvider>
                </EchoProvider>
              </AuthProvider>
            </GoogleOAuthWrapper>
          </QueryProvider>
        </ThemeProvider>

        <div id="modal-root" />
      </body>
    </html>
  );
}
