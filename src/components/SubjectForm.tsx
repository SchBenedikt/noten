import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subject } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  type: z.enum(["main", "secondary"]),
  writtenWeight: z.number().min(1).max(2).optional(),
});

interface SubjectFormProps {
  onSubmit: (subject: Omit<Subject, "id" | "grades">) => void;
}

export const SubjectForm = ({ onSubmit }: SubjectFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "main",
      writtenWeight: 2,
    },
  });

  const watchType = form.watch("type");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit({
            name: data.name,
            type: data.type,
            writtenWeight: data.type === "main" ? data.writtenWeight : undefined,
          });
          form.reset();
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Art</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Wähle die Art des Fachs" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-full bg-popover shadow-lg">
                  <SelectItem value="main">Hauptfach</SelectItem>
                  <SelectItem value="secondary">Nebenfach</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === "main" && (
          <FormField
            control={form.control}
            name="writtenWeight"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Gewichtung der Schulaufgaben</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Wähle die Gewichtung" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full bg-popover shadow-lg">
                    <SelectItem value="1">Einfach</SelectItem>
                    <SelectItem value="2">Doppelt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          Fach hinzufügen
        </Button>
      </form>
    </Form>
  );
};