
'use client';

import Link from 'next/link';
import { EduTrackLogo } from './EduTrackLogo';
import { useAuth, useUser } from '@/firebase/provider';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-auto">
          <EduTrackLogo className="h-6 w-6" />
          <span className="font-bold text-lg">EduTrack</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            {user.displayName ? (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hello, <span className="font-bold text-primary">{user.displayName}</span>
              </span>
            ) : (
               user.email && <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
