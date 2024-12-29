import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmailForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Bitte überprüfen Sie Ihre E-Mails zur Bestätigung.",
      });
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Neue E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Wird aktualisiert..." : "E-Mail aktualisieren"}
      </Button>
    </form>
  );
};