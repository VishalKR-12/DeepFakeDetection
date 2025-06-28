import { Logo } from './Logo';

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50 print:hidden">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          DeepDetect
        </h1>
      </div>
    </header>
  );
}
