import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Plane, GraduationCap, Map, Image as ImageIcon, Phone, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Destinations", href: "/destinations" },
  { label: "Programs", href: "/programs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-border/40 py-2" : "bg-transparent py-4 text-white"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link href="/">
          <div className={cn(
            "flex items-center gap-2 cursor-pointer transition-all duration-300 rounded-xl p-1.5",
            !scrolled && "bg-white shadow-lg"
          )}>
            <img 
              src="/assets/logo.png" 
              alt="Edufly Overseas" 
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "cursor-pointer text-sm font-semibold transition-colors hover:text-secondary",
                location === item.href ? "text-secondary" : (scrolled ? "text-foreground" : "text-white/90")
              )}>
                {item.label}
              </span>
            </Link>
          ))}
          <Link href="/counselling">
            <Button 
              className={cn(
                "rounded-full px-6 font-bold shadow-lg transition-transform hover:scale-105",
                scrolled ? "bg-primary hover:bg-primary/90 text-white" : "bg-white text-primary hover:bg-white/90"
              )}
            >
              Book Now
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className={cn("w-6 h-6", scrolled ? "text-foreground" : "text-white")} />
          ) : (
            <Menu className={cn("w-6 h-6", scrolled ? "text-foreground" : "text-white")} />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-xl p-4 flex flex-col gap-4 lg:hidden animate-in slide-in-from-top-5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span 
                className={cn(
                  "block py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-colors",
                  location === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </span>
            </Link>
          ))}
          <Link href="/counselling">
            <Button className="w-full rounded-lg bg-primary text-white font-bold" onClick={() => setIsOpen(false)}>
              Book Consultation Now
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
