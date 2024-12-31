import { Button } from '@/components/ui/button';
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

interface GradeDialogsProps {
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  deletingGradeId: string | null;
  setDeletingGradeId: (id: string | null) => void;
  onDeleteGrade: (gradeId: string) => void;
}

export const GradeDialogs = ({
  showLoginDialog,
  setShowLoginDialog,
  deletingGradeId,
  setDeletingGradeId,
  onDeleteGrade,
}: GradeDialogsProps) => {
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
              <Button onClick={() => window.location.href = '/login'}>
                Jetzt registrieren
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={deletingGradeId !== null} 
        onOpenChange={() => setDeletingGradeId(null)}
      >
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
              onClick={() => {
                if (deletingGradeId) {
                  onDeleteGrade(deletingGradeId);
                  setDeletingGradeId(null);
                }
              }}
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