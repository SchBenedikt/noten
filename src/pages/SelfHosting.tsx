import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SelfHosting = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Supabase Self-Hosting Guide</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Systemvoraussetzungen</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Docker Engine (Version 19.03.0+)</li>
            <li>Docker Compose (Version 1.28.0+)</li>
            <li>Git</li>
            <li>Mindestens 4GB RAM</li>
            <li>Mindestens 2 CPU Kerne</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Installation</h2>
          <ol className="list-decimal list-inside space-y-4">
            <li>Klone das offizielle Supabase Docker Repository:
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                git clone https://github.com/supabase/supabase-docker.git
              </pre>
            </li>
            <li>Wechsle in das Verzeichnis:
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                cd supabase-docker
              </pre>
            </li>
            <li>Kopiere die Beispiel-Konfigurationsdatei:
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                cp .env.example .env
              </pre>
            </li>
            <li className="space-y-2">
              <p>Bearbeite die .env Datei und setze folgende wichtige Variablen:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>POSTGRES_PASSWORD (Datenbank-Passwort)</li>
                <li>JWT_SECRET (Zufälliger String für JWT-Token)</li>
                <li>ANON_KEY (API Key für anonyme Zugriffe)</li>
                <li>SERVICE_ROLE_KEY (API Key für Admin-Zugriffe)</li>
              </ul>
            </li>
            <li>Starte die Docker Container:
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                docker compose up -d
              </pre>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Zugriff auf die Services</h2>
          <p className="mb-4">Nach erfolgreicher Installation sind folgende Dienste verfügbar:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Studio (Dashboard): http://localhost:3000</li>
            <li>API: http://localhost:8000</li>
            <li>Database: http://localhost:5432</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Sicherheitshinweise</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Ändere alle Standard-Passwörter</li>
            <li>Beschränke den Zugriff auf die Ports</li>
            <li>Aktiviere SSL für Produktionsumgebungen</li>
            <li>Richte regelmäßige Backups ein</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Nächste Schritte</h2>
          <p className="mb-4">
            Nachdem Sie Ihre eigene Supabase-Instanz eingerichtet haben, können Sie mit der Einrichtung der Datenbank fortfahren.
          </p>
          <Button 
            onClick={() => navigate("/database-setup")}
            className="mt-4"
          >
            Weiter zur Datenbank-Einrichtung
          </Button>
        </section>
      </div>
    </div>
  );
};

export default SelfHosting;