import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const DatabaseSetup = () => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = async (text: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [blockId]: true });
      toast.success("Code wurde in die Zwischenablage kopiert!");
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [blockId]: false });
      }, 2000);
    } catch (err) {
      toast.error("Fehler beim Kopieren des Codes");
    }
  };

  const CodeBlock = ({ id, code, title }: { id: string; code: string; title?: string }) => (
    <div className="relative bg-gray-100 rounded-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-2">
        {title && <h3 className="text-sm font-medium text-gray-700">{title}</h3>}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-4 right-4 gap-2"
        >
          {copiedStates[id] ? (
            <>
              <Check className="h-4 w-4" />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Kopieren
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="h-[200px] w-full rounded-md border bg-white p-4">
        <pre className="text-sm">
          {code}
        </pre>
      </ScrollArea>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Datenbank Setup Guide</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Supabase Projekt erstellen</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Gehe zu <a href="https://supabase.com" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a> und erstelle einen Account</li>
            <li>Klicke auf "New Project"</li>
            <li>Wähle einen Namen und ein Passwort für dein Projekt</li>
            <li>Wähle eine Region (am besten in Europa)</li>
            <li>Klicke auf "Create Project"</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Tabellen erstellen</h2>
          <p className="mb-4">Öffne den SQL Editor in deinem Supabase Dashboard und führe die folgenden Befehle aus:</p>
          
          <CodeBlock
            id="profiles"
            title="Profiles Tabelle"
            code={`create table public.profiles (
    id uuid primary key references auth.users on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    grade_level integer default 5 not null,
    school_id uuid references public.schools,
    first_name text
);`}
          />

          <CodeBlock
            id="schools"
            title="Schools Tabelle"
            code={`create table public.schools (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users not null
);`}
          />

          <CodeBlock
            id="subjects"
            title="Subjects Tabelle"
            code={`create table public.subjects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    name text not null,
    type text not null,
    written_weight integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    school_id uuid references public.schools,
    grade_level integer default 5 not null
);`}
          />

          <CodeBlock
            id="grades"
            title="Grades Tabelle"
            code={`create table public.grades (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid references public.subjects not null,
    value numeric not null,
    weight numeric not null,
    type text not null,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    notes text
);`}
          />

          <CodeBlock
            id="archived_subjects"
            title="Archived Subjects Tabelle"
            code={`create table public.archived_subjects (
    id uuid primary key default gen_random_uuid(),
    original_subject_id uuid not null,
    user_id uuid references auth.users not null,
    name text not null,
    type text not null,
    written_weight integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    archived_at timestamp with time zone default timezone('utc'::text, now()) not null,
    grade_level integer not null
);`}
          />

          <CodeBlock
            id="archived_grades"
            title="Archived Grades Tabelle"
            code={`create table public.archived_grades (
    id uuid primary key default gen_random_uuid(),
    archived_subject_id uuid references public.archived_subjects not null,
    original_grade_id uuid not null,
    value numeric not null,
    weight numeric not null,
    type text not null,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    notes text
);`}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. RLS Policies erstellen</h2>
          <p className="mb-4">Aktiviere Row Level Security und erstelle die notwendigen Policies:</p>

          <CodeBlock
            id="rls_policies"
            code={`-- Enable RLS
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.subjects enable row level security;
alter table public.grades enable row level security;
alter table public.archived_subjects enable row level security;
alter table public.archived_grades enable row level security;

-- Profiles policies
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can update their first name" on public.profiles for update using (auth.uid() = id);
create policy "Users can update their school" on public.profiles for update using (auth.uid() = id);

-- Schools policies
create policy "Everyone can view schools" on public.schools for select using (true);
create policy "Authenticated users can create schools" on public.schools for insert with check (auth.uid() = created_by);
create policy "Users can update their own schools" on public.schools for update using (auth.uid() = created_by);
create policy "Users can delete their own schools" on public.schools for delete using (auth.uid() = created_by);

-- Subjects policies
create policy "Users can view their own subjects" on public.subjects for select using (auth.uid() = user_id);
create policy "Users can insert their own subjects" on public.subjects for insert with check (auth.uid() = user_id);
create policy "Users can update their own subjects" on public.subjects for update using (auth.uid() = user_id);
create policy "Users can delete their own subjects" on public.subjects for delete using (auth.uid() = user_id);

-- Grades policies
create policy "Users can view grades for their subjects" on public.grades for select using (
  exists (
    select 1 from subjects where subjects.id = grades.subject_id and subjects.user_id = auth.uid()
  )
);
create policy "Users can insert grades for their subjects" on public.grades for insert with check (
  exists (
    select 1 from subjects where subjects.id = subject_id and subjects.user_id = auth.uid()
  )
);
create policy "Users can update grades for their subjects" on public.grades for update using (
  exists (
    select 1 from subjects where subjects.id = grades.subject_id and subjects.user_id = auth.uid()
  )
);
create policy "Users can delete grades for their subjects" on public.grades for delete using (
  exists (
    select 1 from subjects where subjects.id = grades.subject_id and subjects.user_id = auth.uid()
  )
);

-- Archived subjects policies
create policy "Users can view their archived subjects" on public.archived_subjects for select using (auth.uid() = user_id);
create policy "Users can insert their archived subjects" on public.archived_subjects for insert with check (auth.uid() = user_id);

-- Archived grades policies
create policy "Users can view grades for their archived subjects" on public.archived_grades for select using (
  exists (
    select 1 from archived_subjects where archived_subjects.id = archived_grades.archived_subject_id and archived_subjects.user_id = auth.uid()
  )
);
create policy "Users can insert grades for their archived subjects" on public.archived_grades for insert with check (
  exists (
    select 1 from archived_subjects where archived_subjects.id = archived_subject_id and archived_subjects.user_id = auth.uid()
  )
);`}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Trigger für neue Benutzer erstellen</h2>
          <p className="mb-4">Erstelle einen Trigger, der automatisch ein Profil für neue Benutzer anlegt:</p>

          <CodeBlock
            id="trigger"
            code={`-- Create the function that handles new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Archivierungsfunktion erstellen</h2>
          <p className="mb-4">Erstelle die Funktion zum Archivieren von Fächern:</p>

          <CodeBlock
            id="archive_function"
            code={`-- Create the archiving function
create or replace function public.archive_subjects_for_user(user_uuid uuid)
returns void
language plpgsql
security definer
as $$
declare
    subject_record record;
begin
    -- Archive each subject and its grades
    for subject_record in 
        select * from subjects 
        where user_id = user_uuid
    loop
        -- Insert into archived_subjects
        with archived_subject as (
            insert into archived_subjects (
                original_subject_id,
                user_id,
                name,
                type,
                written_weight,
                grade_level
            )
            select 
                subject_record.id,
                subject_record.user_id,
                subject_record.name,
                subject_record.type,
                subject_record.written_weight,
                (select grade_level from profiles where id = user_uuid)
            returning id
        )
        -- Archive grades for this subject
        insert into archived_grades (
            archived_subject_id,
            original_grade_id,
            value,
            weight,
            type,
            date,
            notes
        )
        select 
            (select id from archived_subject),
            grades.id,
            grades.value,
            grades.weight,
            grades.type,
            grades.date,
            grades.notes
        from grades
        where grades.subject_id = subject_record.id;
    end loop;
end;
$$;`}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Konfiguration abschließen</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Aktiviere Email Auth in den Authentication Settings</li>
            <li>Kopiere deine Projekt-URL und den anon key aus den Project Settings</li>
            <li>Aktualisiere die Werte in der <code>src/integrations/supabase/client.ts</code> Datei</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default DatabaseSetup;