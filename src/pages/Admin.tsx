
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Edit, Trash2, Search, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Interfaces für Benutzer und Schulen
interface User {
  id: string;
  first_name: string | null;
  grade_level: number;
  email?: string;
  created_at?: string;
  school_id?: string | null;
}

interface School {
  id: string;
  name: string;
}

// Validierungsschema für das Benutzerformular
const userFormSchema = z.object({
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  first_name: z.string().min(1, "Vorname darf nicht leer sein"),
  grade_level: z.coerce.number().min(1).max(13),
  school_id: z.string().optional(),
});

// Schema für das Bearbeiten von Benutzern
const userEditFormSchema = z.object({
  first_name: z.string().min(1, "Vorname darf nicht leer sein"),
  grade_level: z.coerce.number().min(1).max(13),
  school_id: z.string().optional(),
});

// Schema für Admin-Login
const adminLoginSchema = z.object({
  password: z.string().min(1, "Passwort wird benötigt"),
});

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(true);
  const [adminLoginError, setAdminLoginError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Formular zur Benutzerverwaltung
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      grade_level: 5,
      school_id: undefined,
    },
  });

  // Formular zum Bearbeiten von Benutzern
  const editForm = useForm<z.infer<typeof userEditFormSchema>>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      first_name: "",
      grade_level: 5,
      school_id: undefined,
    },
  });

  // Formular für Admin-Login
  const adminLoginForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    checkAuthStatus();
    fetchSchools();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (selectedUser && isEditing) {
      editForm.reset({
        first_name: selectedUser.first_name || "",
        grade_level: selectedUser.grade_level,
        school_id: selectedUser.school_id || undefined,
      });
    }
  }, [selectedUser, isEditing, editForm]);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
  };

  const handleAdminLogin = (values: z.infer<typeof adminLoginSchema>) => {
    setAdminLoginError("");
    if (values.password === "admin123") {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      setAdminLoginError("Falsches Passwort");
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      setUsers(profiles || []);
    } catch (error: any) {
      console.error('Fehler beim Laden der Benutzer:', error);
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Schulen:', error);
    }
  };

  const handleUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true);
    
    try {
      // Diese Funktion ist für das Erstellen neuer Benutzer
      // In Zukunft kann hier die Admin-User-Erstellung implementiert werden
      toast({
        title: "Info",
        description: "Das Erstellen neuer Benutzer wird in Kürze implementiert.",
      });
      
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Fehler:', error);
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUserSubmit = async (values: z.infer<typeof userEditFormSchema>) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      console.log("Updating user with values:", values);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          grade_level: values.grade_level,
          school_id: values.school_id || null,
        })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Erfolg",
        description: "Benutzer wurde aktualisiert.",
      });
      
      setIsEditing(false);
      setSelectedUser(null);
      fetchUsers(); // Aktualisierte Benutzerliste laden
    } catch (error: any) {
      console.error('Fehler bei der Benutzeraktualisierung:', error);
      toast({
        title: "Fehler",
        description: error.message || "Benutzer konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      console.log("Deleting user with ID:", selectedUser.id);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Erfolg",
        description: "Benutzer wurde gelöscht.",
      });
      
      setIsDeleting(false);
      setSelectedUser(null);
      fetchUsers(); // Aktualisierte Benutzerliste laden
    } catch (error: any) {
      console.error('Fehler beim Löschen des Benutzers:', error);
      toast({
        title: "Fehler",
        description: error.message || "Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Zugriff verweigert</CardTitle>
              <CardDescription>
                Sie müssen angemeldet sein, um auf den Admin-Bereich zuzugreifen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Bitte melden Sie sich an, um fortzufahren.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Admin-Login
              </CardTitle>
              <CardDescription>
                Bitte geben Sie das Admin-Passwort ein
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...adminLoginForm}>
                <form onSubmit={adminLoginForm.handleSubmit(handleAdminLogin)} className="space-y-4">
                  <FormField
                    control={adminLoginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin-Passwort</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password" 
                            placeholder="Passwort eingeben" 
                            className={adminLoginError ? "border-red-500" : ""}
                          />
                        </FormControl>
                        {adminLoginError && (
                          <p className="text-sm text-red-500 mt-1">{adminLoginError}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Anmelden
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Admin-Bereich</h1>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Benutzerverwaltung</CardTitle>
                <CardDescription>
                  Benutzer verwalten und bearbeiten
                </CardDescription>
              </div>
              <Dialog open={isEditing && !selectedUser} onOpenChange={(open) => {
                setIsEditing(open && !selectedUser);
                if (!open) setSelectedUser(null);
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setIsEditing(true);
                    setSelectedUser(null);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Benutzer erstellen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
                    <DialogDescription>
                      Füllen Sie das Formular aus, um einen neuen Benutzer zu erstellen
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUserSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vorname</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Vorname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Klassenstufe</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Klassenstufe wählen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
                                  <SelectItem key={grade} value={grade.toString()}>
                                    {grade}. Klasse
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-Mail</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="email@beispiel.de" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passwort</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" placeholder="Passwort" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="school_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schule</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value || "none"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Schule wählen (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Keine Schule</SelectItem>
                                {schools.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Abbrechen</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Wird gespeichert..." : "Erstellen"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Benutzer suchen..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Vorname</th>
                      <th className="px-4 py-2 text-left">Klasse</th>
                      <th className="px-4 py-2 text-left">Erstellt</th>
                      <th className="px-4 py-2 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{user.first_name || "Unbenannt"}</td>
                        <td className="px-4 py-3">{user.grade_level}. Klasse</td>
                        <td className="px-4 py-3">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unbekannt"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Benutzer bearbeiten Dialog */}
                            <Dialog 
                              open={isEditing && selectedUser?.id === user.id} 
                              onOpenChange={(open) => {
                                if (!open) {
                                  setIsEditing(false);
                                  setSelectedUser(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Benutzer bearbeiten</DialogTitle>
                                  <DialogDescription>
                                    Bearbeiten Sie die Informationen des Benutzers
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Form {...editForm}>
                                  <form onSubmit={editForm.handleSubmit(handleEditUserSubmit)} className="space-y-4">
                                    <FormField
                                      control={editForm.control}
                                      name="first_name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Vorname</FormLabel>
                                          <FormControl>
                                            <Input {...field} placeholder="Vorname" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={editForm.control}
                                      name="grade_level"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Klassenstufe</FormLabel>
                                          <Select 
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value.toString()}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Klassenstufe wählen" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
                                                <SelectItem key={grade} value={grade.toString()}>
                                                  {grade}. Klasse
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={editForm.control}
                                      name="school_id"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Schule</FormLabel>
                                          <Select 
                                            onValueChange={field.onChange}
                                            value={field.value || "none"}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Schule wählen (optional)" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="none">Keine Schule</SelectItem>
                                              {schools.map((school) => (
                                                <SelectItem key={school.id} value={school.id}>
                                                  {school.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button type="button" variant="outline">Abbrechen</Button>
                                      </DialogClose>
                                      <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Wird aktualisiert..." : "Speichern"}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            
                            {/* Benutzer löschen Dialog */}
                            <Dialog 
                              open={isDeleting && selectedUser?.id === user.id} 
                              onOpenChange={(open) => {
                                if (!open) {
                                  setIsDeleting(false);
                                  setSelectedUser(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleting(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Benutzer löschen</DialogTitle>
                                  <DialogDescription>
                                    Möchten Sie den Benutzer "{user.first_name || 'Unbenannt'}" wirklich löschen?
                                    Diese Aktion kann nicht rückgängig gemacht werden.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Abbrechen</Button>
                                  </DialogClose>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteUser}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? "Wird gelöscht..." : "Löschen"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Keine Benutzer gefunden." : "Keine Benutzer vorhanden."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
