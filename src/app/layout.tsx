import type { Metadata } from 'next';
import '@/src/app/globals.css';

export const metadata: Metadata = {
  title: 'Shopping Video Preview',
  description: 'Your premium shopping platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-custom-bg text-custom-text-primary">
        {children}
      </body>
    </html>
  );
}
