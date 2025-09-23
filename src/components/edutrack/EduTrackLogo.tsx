import { cn } from '@/lib/utils';

export const EduTrackLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('text-primary', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EduTrack Logo"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2L3 7V17L12 22L21 17V7L12 2ZM5 8.38171L12 12.3334L19 8.38171V15.6183L12 19.6666L5 15.6183V8.38171Z"
      />
      <path d="M12 14L8 11.5L12 9L16 11.5L12 14Z" />
    </svg>
  );
};
