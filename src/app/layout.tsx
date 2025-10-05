
import type { Metadata } from 'next';
import { AppDataProvider } from '@/context/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/edutrack/AppHeader';
import { FirebaseClientProvider } from '@/firebase/client-provider';


const APP_NAME = "EduTrack";
const APP_DEFAULT_TITLE = "EduTrack - Student Exam & Syllabus Tracker";
const APP_TITLE_TEMPLATE = "%s - EduTrack";
const APP_DESCRIPTION = "A modern way to track your exams, subjects, and study progress.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
          <FirebaseClientProvider>
            <AppDataProvider>
              <div className="relative flex min-h-screen flex-col">
                <AppHeader />
                <main className="flex-1">{children}</main>
                <footer className="w-full border-t border-border bg-background py-4">
                  <div className="container text-center text-sm text-muted-foreground">
                    All Right Reserved By{' '}
                    <span className="font-semibold text-primary">
                      TANVIR MAHMUD
                    </span>
                  </div>
                </footer>
              </div>
              <Toaster />
            </AppDataProvider>
          </FirebaseClientProvider>
      </body>
    </html>
  );
}
