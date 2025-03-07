
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeSettings from "@/components/ThemeSettings";

type ThemeType = "default" | "purple" | "teal" | "orange" | "pink";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>("default");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Load theme from cookie on initial load
    const savedTheme = Cookies.get("app-theme") as ThemeType;
    if (savedTheme && ["default", "purple", "teal", "orange", "pink"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme by adding/removing classes from document.documentElement
    document.documentElement.classList.remove(
      "theme-default",
      "theme-purple",
      "theme-teal",
      "theme-orange",
      "theme-pink"
    );
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Save theme preference to cookie
    Cookies.set("app-theme", theme, { expires: 365 });
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 rounded-full shadow-lg z-10 backdrop-blur-sm bg-background/80"
            title="Theme-Einstellungen"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0 w-80 sm:w-96">
          <ThemeSettings onClose={() => setIsSettingsOpen(false)} />
        </SheetContent>
      </Sheet>
    </ThemeContext.Provider>
  );
};
