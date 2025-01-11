<Auth
  supabaseClient={supabase}
  appearance={{
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: "hsl(var(--primary))",
          brandAccent: "hsl(var(--primary) / 0.9)",
        },
      },
    },
    className: {
      container: "space-y-4",
      button:
        "w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors",
      input:
        "w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
      label: "block text-sm font-medium text-foreground mb-1",
      anchor: "text-sm text-primary hover:text-primary/90",
      divider: "text-muted-foreground",
      message: "text-sm text-muted-foreground",
    },
  }}
  localization={{
    variables: {
      sign_in: {
        email_label: "E-Mail Adresse",
        password_label: "Passwort",
        button_label: "Anmelden",
        loading_button_label: "Wird angemeldet...",
        social_provider_text: "Anmelden mit {{provider}}",
        link_text: "Bereits registriert? Anmelden",
      },
      magic_link: {
        email_input_label: "E-Mail Adresse",
        button_label: "Link senden",
        loading_button_label: "Link wird gesendet...",
        link_text: "Login mit Magic Link",
      },
      forgotten_password: {
        email_label: "E-Mail Adresse",
        button_label: "Passwort zurücksetzen",
        loading_button_label: "Sende Anweisungen...",
        link_text: "Passwort vergessen?",
      },
    },
  }}
  theme="default"
  providers={[]}
  view="sign_in"
/>

<Button
  variant="outline"
  className="w-full"
  onClick={() => setShowRegistration(true)}
>
  Neu hier? Registriere dich
</Button>
