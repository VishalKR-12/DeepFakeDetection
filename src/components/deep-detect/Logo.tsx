import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-8 h-8", className)}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h1v-2h-1c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8c0 1.04-.2 2.02-.57 2.92" />
      <path d="M16.5 10.5c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5z" />
      <circle cx="16.5" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}
