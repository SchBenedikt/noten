
import { Home, BookOpen, LogOut, User, GraduationCap, PenTool, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setUserRole(data?.role || 'student');
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

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

  // Base menu items for all users
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
  ];

  // Add teacher-specific menu items
  if (userRole === 'teacher') {
    menuItems.push({
      icon: PenTool,
      label: "Meine Klassen",
      onClick: () => navigate("/teacher-classes"),
      active: location.pathname === "/teacher-classes",
    });
    menuItems.push({
      icon: Users,
      label: "Schüler",
      onClick: () => navigate("/students"),
      active: location.pathname === "/students",
    });
  }

  // Add student-specific menu items
  if (userRole === 'student') {
    menuItems.push({
      icon: BookOpen,
      label: "Freunde",
      onClick: () => navigate("/friends"),
      active: location.pathname === "/friends",
    });
  }

  return (
    <aside className="bg-background border-r border-border h-screen w-[240px] hidden md:block overflow-y-auto">
      <div className="flex flex-col h-full py-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Notenverwaltung</h2>
          {userRole && (
            <div className="mt-1 flex items-center">
              <div className="rounded-full bg-primary/10 p-1">
                {userRole === 'teacher' ? (
                  <PenTool className="h-3 w-3 text-primary" />
                ) : (
                  <GraduationCap className="h-3 w-3 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {userRole === 'teacher' ? 'Lehrer/in' : 'Schüler/in'}
              </span>
            </div>
          )}
        </div>

        <nav className="mt-8 flex-1">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            </div>
          ) : (
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
          )}
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
