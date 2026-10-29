import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <Button
      type="button"
      size="icon"
      aria-label="Back to top"
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 z-50 size-11 rounded-full bg-brand-gradient text-white shadow-lg hover:scale-105 hover:opacity-95 transition-all duration-300 animate-in fade-in zoom-in-75 cursor-pointer border-0"
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}
