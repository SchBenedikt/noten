
import { Home, BookOpen, LogOut, User, GraduationCap, PenTool, Users, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    
    // Check screen size on initial render
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    checkScreenSize();

    // Add screen resize listener
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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
      onClick: () => {
        navigate("/dashboard");
        setIsMobileOpen(false);
      },
      active: location.pathname === "/dashboard",
    },
    {
      icon: User,
      label: "Profil",
      onClick: () => {
        navigate("/profile");
        setIsMobileOpen(false);
      },
      active: location.pathname === "/profile",
    },
  ];

  // Add teacher-specific menu items
  if (userRole === 'teacher') {
    menuItems.push({
      icon: PenTool,
      label: "Meine Klassen",
      onClick: () => {
        navigate("/teacher-classes");
        setIsMobileOpen(false);
      },
      active: location.pathname === "/teacher-classes",
    });
    menuItems.push({
      icon: Users,
      label: "Schüler",
      onClick: () => {
        navigate("/students");
        setIsMobileOpen(false);
      },
      active: location.pathname === "/students",
    });
  }

  // Add student-specific menu items
  if (userRole === 'student') {
    menuItems.push({
      icon: BookOpen,
      label: "Freunde",
      onClick: () => {
        navigate("/friends");
        setIsMobileOpen(false);
      },
      active: location.pathname === "/friends",
    });
  }

  // Mobile menu button that appears in the header
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      aria-label={isMobileOpen ? "Schließen" : "Öffnen"} 
    >
      {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
    </Button>
  );

  // Mobile overlay for the sidebar
  const MobileOverlay = () => (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
        isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setIsMobileOpen(false)}
    />
  );

  // Desktop sidebar toggle button - Updated to ensure it's fully visible
  const SidebarToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      className="hidden md:flex absolute -right-4 top-6 z-20 h-7 w-7 rounded-full items-center justify-center bg-background border shadow-sm"
      onClick={() => setIsCollapsed(!isCollapsed)}
      aria-label={isCollapsed ? "Ausklappen" : "Einklappen"}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        className={cn(
          "transition-transform duration-300", 
          isCollapsed ? "rotate-180" : ""
        )}
      >
        <path 
          d="M15 6L9 12L15 18" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );

  return (
    <>
      <MobileMenuButton />
      <MobileOverlay />
      
      {/* Sidebar component */}
      <aside
        className={cn(
          "bg-background border-r border-border overflow-hidden transition-all duration-300 ease-in-out z-50 h-screen flex flex-col",
          // Desktop states
          "hidden md:flex fixed",
          isCollapsed ? "md:w-16" : "md:w-[240px]",
          // Mobile states
          isMobileOpen ? "fixed inset-y-0 left-0 w-[240px]" : "hidden"
        )}
      >
        <div className="flex flex-col h-full py-4 relative">
          <SidebarToggle />
          
          <div className={cn(
            "px-4 py-2 flex items-center",
            isCollapsed && "justify-center"
          )}>
            {!isCollapsed ? (
              <div>
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
            ) : (
              <div className="rounded-full bg-primary/10 p-2">
                {userRole === 'teacher' ? (
                  <PenTool className="h-5 w-5 text-primary" />
                ) : (
                  <GraduationCap className="h-5 w-5 text-primary" />
                )}
              </div>
            )}
          </div>

          <nav className="mt-8 flex-1 overflow-y-auto">
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
                        "w-full flex",
                        isCollapsed ? "justify-center px-2" : "justify-start",
                        item.active && "bg-accent text-accent-foreground"
                      )}
                      onClick={item.onClick}
                    >
                      <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          {/* Fixed logout button at the bottom */}
          <div className="mt-auto px-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full flex mb-2",
                isCollapsed ? "justify-center px-2" : "justify-start",
                "text-red-500 hover:text-red-600 hover:bg-red-50"
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span>Abmelden</span>}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Spacer div that creates the appropriate margin when sidebar is expanded */}
      <div className={cn(
        "hidden md:block transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-[240px]"
      )} />
    </>
  );
};
