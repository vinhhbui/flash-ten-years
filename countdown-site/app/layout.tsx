import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_TITLE = 'FLASHBACK';
const SITE_DESCRIPTION = 'FLASHBACK - 10 năm của Flash là một chiếc máy ảnh được chuyền tay qua nhiều thế hệ. Mỗi thế hệ giữ một “cuộn film” riêng, lưu giữ khoảnh khắc, câu chuyện và dấu ấn của năm đó. Có frame rất đẹp, có frame chưa hoàn hảo - Ghép tất cả lại là hành trình 10 năm.';

export const metadata: Metadata = {
  metadataBase: new URL('https://flashback.clbltv.org'),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_TITLE,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: SITE_TITLE,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'FLASHBACK - Hành trình 10 năm của Flash',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
