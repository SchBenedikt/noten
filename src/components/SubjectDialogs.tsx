import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubjectDialogsProps {
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  subjectName: string;
  onDeleteSubject: () => void;
}

export const SubjectDialogs = ({
  showLoginDialog,
  setShowLoginDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  subjectName,
  onDeleteSubject
}: SubjectDialogsProps) => {
  return (
    <>
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrierung erforderlich</AlertDialogTitle>
            <AlertDialogDescription>
              Um Noten zu bearbeiten und zu speichern, erstellen Sie bitte ein kostenloses Konto. 
              So können Sie Ihre Noten dauerhaft speichern und von überall darauf zugreifen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction asChild>
              <button onClick={() => window.location.href = '/login'}>
                Jetzt registrieren
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fach löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Fach "{subjectName}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteSubject}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};