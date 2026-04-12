import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from '@/shared/lib/context/NotificationContext';
import { AuthProvider } from '@/shared/lib/context/AuthContext';
import { ToastProvider } from '@/shared/lib/context/ToastContext';
import { EchoProvider } from '@/shared/lib/providers/EchoProvider';
import { ThemeProvider } from 'next-themes';
import QueryProvider from '@/components/providers/QueryProvider';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bienvenido al Lyrium Marketplace",
  description: "Tu marketplace de confianza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[var(--bg-primary)]`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <GoogleOAuthWrapper>
              <AuthProvider>
                <EchoProvider>
                  <NotificationProvider>
                    <ToastProvider>
                      {children}
                    </ToastProvider>
                  </NotificationProvider>
                </EchoProvider>
              </AuthProvider>
            </GoogleOAuthWrapper>
          </QueryProvider>
        </ThemeProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
