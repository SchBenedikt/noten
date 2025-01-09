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
import { Button } from "@/components/ui/button";

interface GradeDialogsProps {
  showLoginDialog: boolean;
  showDeleteDialog: boolean;
  onLoginDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
}

export const GradeDialogs = ({
  showLoginDialog,
  showDeleteDialog,
  onLoginDialogChange,
  onDeleteDialogChange,
  onDeleteConfirm,
}: GradeDialogsProps) => {
  return (
    <>
      <AlertDialog open={showLoginDialog} onOpenChange={onLoginDialogChange}>
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
              <Button onClick={() => window.location.href = '/login'}>
                Jetzt registrieren
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Note löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Note wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
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