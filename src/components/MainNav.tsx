import { Menu, LogOut, UserRound } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function MainNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-xl font-semibold">Subject Sculptor</h1>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate("/profile")}
        >
          <UserRound className="h-5 w-5" />
          Profileinstellungen
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Abmelden
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menü</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-6">
              <Button
                variant="ghost"
                className="flex items-center gap-2 justify-start"
                onClick={() => navigate("/profile")}
              >
                <UserRound className="h-5 w-5" />
                Profileinstellungen
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Abmelden
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}