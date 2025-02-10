import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useAchievements } from "@/hooks/use-achievements";

const formSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  type: z.string().min(1, "Typ ist erforderlich"),
});

export const AdminAchievementForm = ({ onSubmit, achievement, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: achievements, refetch } = useAchievements();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: achievement?.title || "",
      description: achievement?.description || "",
      type: achievement?.type || "",
    },
  });

  useEffect(() => {
    if (achievement) {
      setIsEditing(true);
      form.reset({
        title: achievement.title,
        description: achievement.description,
        type: achievement.type,
      });
    } else {
      setIsEditing(false);
      form.reset({
        title: "",
        description: "",
        type: "",
      });
    }
  }, [achievement, form]);

  const handleFormSubmit = async (data) => {
    if (isEditing) {
      await onUpdate({ ...achievement, ...data });
    } else {
      await onSubmit(data);
    }
    refetch();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
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
            <FormItem>
              <FormLabel>Typ</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {isEditing && (
            <Button variant="destructive" onClick={() => onDelete(achievement.id)}>
              Löschen
            </Button>
          )}
          <Button type="submit">{isEditing ? "Aktualisieren" : "Hinzufügen"}</Button>
        </div>
      </form>
    </Form>
  );
};
