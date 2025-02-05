import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

interface SmtpSettingsProps {
  currentSmtpHost: string | null;
  currentSmtpPort: number | null;
  currentSmtpUser: string | null;
  currentSmtpFromEmail: string | null;
  onSmtpSettingsChange: () => void;
}

export const SmtpSettings = ({
  currentSmtpHost,
  currentSmtpPort,
  currentSmtpUser,
  currentSmtpFromEmail,
  onSmtpSettingsChange,
}: SmtpSettingsProps) => {
  const { toast } = useToast();
  const [smtpHost, setSmtpHost] = useState(currentSmtpHost || "");
  const [smtpPort, setSmtpPort] = useState(currentSmtpPort?.toString() || "587");
  const [smtpUser, setSmtpUser] = useState(currentSmtpUser || "");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState(currentSmtpFromEmail || "");

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        smtp_host: smtpHost || null,
        smtp_port: smtpPort ? parseInt(smtpPort) : null,
        smtp_user: smtpUser || null,
        smtp_password: smtpPassword || null,
        smtp_from_email: smtpFromEmail || null,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der SMTP-Einstellungen",
        variant: "destructive",
      });
      return;
    }

    onSmtpSettingsChange();
    toast({
      title: "Erfolg",
      description: "SMTP-Einstellungen wurden gespeichert",
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Mail className="mr-2 h-5 w-5" />
        SMTP-Einstellungen
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Host
          </label>
          <Input
            id="smtpHost"
            placeholder="z.B. smtp.gmail.com"
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Port
          </label>
          <Input
            id="smtpPort"
            type="number"
            placeholder="587"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Benutzer
          </label>
          <Input
            id="smtpUser"
            placeholder="beispiel@gmail.com"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Passwort
          </label>
          <Input
            id="smtpPassword"
            type="password"
            placeholder="Dein SMTP Passwort"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="smtpFromEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Absender E-Mail
          </label>
          <Input
            id="smtpFromEmail"
            type="email"
            placeholder="noreply@beispiel.de"
            value={smtpFromEmail}
            onChange={(e) => setSmtpFromEmail(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};