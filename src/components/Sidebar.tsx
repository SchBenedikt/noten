
import { Home, BookOpen, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Abmelden",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      active: location.pathname === "/dashboard",
    },
    {
      icon: User,
      label: "Profil",
      onClick: () => navigate("/profile"),
      active: location.pathname === "/profile",
    },
    {
      icon: BookOpen,
      label: "Freunde",
      onClick: () => navigate("/friends"),
      active: location.pathname === "/friends",
    },
  ];

  return (
    <aside className="bg-background border-r border-border h-screen w-[240px] hidden md:block overflow-y-auto">
      <div className="flex flex-col h-full py-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Notenverwaltung</h2>
        </div>

        <nav className="mt-8 flex-1">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    item.active && "bg-accent text-accent-foreground"
                  )}
                  onClick={item.onClick}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>
    </aside>
  );
};
