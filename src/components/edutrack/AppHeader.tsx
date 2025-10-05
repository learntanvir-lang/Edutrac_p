
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EduTrackLogo } from './EduTrackLogo';
import { useAuth, useUser } from '@/firebase/provider';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles, CircleUser, LogOut, KeyRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChangePasswordDialog } from './auth/ChangePasswordDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2 mr-auto">
            <EduTrackLogo className="h-6 w-6" />
            <span className="font-bold text-lg">EduTrack</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 sm:gap-4 ml-2">
                <span className="text-[1.3rem] font-bold text-primary hidden sm:inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  Hello, {user.displayName || 'User'}
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full transition-transform duration-300 hover:scale-110">
                      <Avatar className="h-9 w-9 border-2 border-primary/50">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start" disabled>
                      <span className="text-xs text-muted-foreground">Logged in as</span>
                      <span className="font-medium text-foreground">{user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>
      {user && (
        <ChangePasswordDialog
          open={isChangePasswordOpen}
          onOpenChange={setChangePasswordOpen}
        />
      )}
    </>
  );
}
