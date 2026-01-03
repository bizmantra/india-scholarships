import Link from "next/link";
import { Search, Bell, User, Save } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Scholarly</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 ml-8 text-sm font-medium">
            <Link href="/scholarships" className="transition-colors hover:text-primary">Find Scholarships</Link>
            <Link href="/eligibility" className="transition-colors hover:text-primary">Check Eligibility</Link>
            <Link href="/guides" className="transition-colors hover:text-primary">Guides</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Save className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-muted transition-colors">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium hidden sm:inline">Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
}
