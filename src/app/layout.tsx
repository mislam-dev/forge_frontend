import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forge Platform',
  description: 'Dashboard for Forge Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
