
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Edit, Trash2, Search, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  FormDescription,
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

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  useEffect(() => {
    // Prüfen, ob der Benutzer angemeldet ist
    checkAuthStatus();
    // Laden der Schulen
    fetchSchools();
  }, []);

  useEffect(() => {
    // Wenn der Benutzer authentifiziert ist, Benutzer laden
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Laden der Benutzerdaten, wenn ein Benutzer zum Bearbeiten ausgewählt wird
  useEffect(() => {
    if (selectedUser && isEditing) {
      form.reset({
        email: selectedUser.email || "",
        password: "", // Passwort wird beim Bearbeiten nicht angezeigt
        first_name: selectedUser.first_name || "",
        grade_level: selectedUser.grade_level,
        school_id: selectedUser.school_id || undefined,
      });
    } else if (!isEditing) {
      form.reset({
        email: "",
        password: "",
        first_name: "",
        grade_level: 5,
        school_id: undefined,
      });
    }
  }, [selectedUser, isEditing, form]);

  // Authentifizierungsstatus überprüfen
  const checkAuthStatus = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setIsAuthenticated(true);
      checkAdminStatus(data.session.user.id);
    }
  };

  // Überprüfen, ob der Benutzer ein Administrator ist
  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setIsAdmin(true);
    }
  };

  // Benutzer abrufen
  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      // Profile abrufen
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Benutzerdaten aus auth.users können wir nur über eine Server-Funktion abrufen
      // Hier verwenden wir nur die Profile-Daten
      setUsers(profiles || []);
    } catch (error) {
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

  // Schulen abrufen
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

  // Admin-Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('check_admin_password', {
        input_password: password
      });

      if (error) throw error;

      if (data) {
        setIsAuthenticated(true);
        toast({
          title: "Erfolgreich angemeldet",
          description: "Sie haben jetzt Zugriff auf die Admin-Funktionen.",
        });
      } else {
        toast({
          title: "Falsches Passwort",
          description: "Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Benutzer erstellen/bearbeiten
  const handleUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true);
    
    try {
      if (isEditing && selectedUser) {
        // Benutzer aktualisieren
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
      } else {
        // Neuen Benutzer erstellen
        // Dies erfordert eine Server-Funktion mit höheren Berechtigungen
        toast({
          title: "Info",
          description: "Das Erstellen neuer Benutzer erfordert eine Server-Funktion (Admin API). Diese Funktion ist noch in Entwicklung.",
        });
      }
      
      // Formulardialog schließen und Daten aktualisieren
      setIsEditing(false);
      setSelectedUser(null);
      fetchUsers();
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

  // Benutzer löschen
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    
    try {
      // Dies erfordert eine Server-Funktion mit höheren Berechtigungen
      toast({
        title: "Info",
        description: "Das Löschen von Benutzern erfordert eine Server-Funktion (Admin API). Diese Funktion ist noch in Entwicklung.",
      });
      
      // Dialog schließen und Daten aktualisieren
      setIsDeleting(false);
      setSelectedUser(null);
      fetchUsers();
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

  // Gefilterte Benutzerliste
  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Login-Formular anzeigen, wenn nicht authentifiziert
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4 max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Anmeldung</CardTitle>
              <CardDescription>
                Bitte geben Sie das Admin-Passwort ein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Admin-Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Lädt..." : "Anmelden"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Hinweis anzeigen, wenn der Benutzer kein Administrator ist
  if (!isAdmin) {
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
                Sie haben keine Administratorrechte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Sie sind mit einem regulären Benutzerkonto angemeldet und haben keinen Zugriff auf Administratorfunktionen.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin-Dashboard anzeigen
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Admin-Bereich</h1>
        </div>
        
        <div className="grid gap-6">
          {/* Benutzerverwaltung */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Benutzerverwaltung</CardTitle>
                <CardDescription>
                  Benutzer verwalten, erstellen und bearbeiten
                </CardDescription>
              </div>
              <Dialog open={isEditing} onOpenChange={(open) => {
                setIsEditing(open);
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
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{selectedUser ? "Benutzer bearbeiten" : "Neuen Benutzer erstellen"}</DialogTitle>
                    <DialogDescription>
                      {selectedUser 
                        ? "Bearbeiten Sie die Informationen des Benutzers" 
                        : "Füllen Sie das Formular aus, um einen neuen Benutzer zu erstellen"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUserSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-Mail</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={isEditing && !!selectedUser} 
                                placeholder="email@beispiel.de"
                              />
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
                            <FormLabel>{selectedUser ? "Neues Passwort (optional)" : "Passwort"}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder={selectedUser ? "Leer lassen, um beizubehalten" : "Passwort"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                              defaultValue={field.value.toString()}
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
                        name="school_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schule</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Schule wählen (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Keine Schule</SelectItem>
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
                          {isLoading ? "Wird gespeichert..." : (selectedUser ? "Aktualisieren" : "Erstellen")}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
                              
                              <Dialog 
                                open={isDeleting && selectedUser?.id === user.id} 
                                onOpenChange={(open) => {
                                  setIsDeleting(open);
                                  if (!open) setSelectedUser(null);
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
    </div>
  );
};

export default Admin;
