import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SubjectForm } from "./SubjectForm";
import { Input } from "@/components/ui/input";
import { SearchIcon, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subject } from "@/types";

interface SubjectSearchProps {
  searchQuery: string;
  searchType: "subject" | "grade" | "note";
  onSearchChange: (query: string) => void;
  onSearchTypeChange: (type: "subject" | "grade" | "note") => void;
  onSubjectAdd: (subject: Omit<Subject, "id" | "grades">) => void;
  currentGradeLevel: number;
}

export const SubjectSearch = ({
  searchQuery,
  searchType,
  onSearchChange,
  onSearchTypeChange,
  onSubjectAdd,
  currentGradeLevel,
}: SubjectSearchProps) => {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const handleSubjectAdd = (subject: Omit<Subject, "id" | "grades">) => {
    onSubjectAdd(subject);
    setSheetOpen(false);
  };

  return (
    <div className="relative flex gap-2">
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-10">+</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Fach hinzufügen</SheetTitle>
          </SheetHeader>
          <SubjectForm
            onSubmit={handleSubjectAdd}
            currentGradeLevel={currentGradeLevel}
          />
        </SheetContent>
      </Sheet>
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={`${searchType === "subject" ? "Fächer" : searchType === "grade" ? "Noten" : "Notizen"} suchen...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-white"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
      <Select
        value={searchType}
        onValueChange={(value: "subject" | "grade" | "note") => onSearchTypeChange(value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Suchen nach..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="subject">Fach</SelectItem>
          <SelectItem value="grade">Note</SelectItem>
          <SelectItem value="note">Notiz</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
