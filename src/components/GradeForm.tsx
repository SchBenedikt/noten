'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { de } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Grade } from '@/types';

interface GradeFormProps {
  onSubmit: (grade: Omit<Grade, 'id'>) => void;
  onCancel?: () => void;
  subjectType?: 'main' | 'secondary';
  initialGrade?: Grade;
}

const FormSchema = z.object({
  dob: z.date({
    required_error: 'A date is required.',
  }),
});

export const GradeForm = ({
  onSubmit,
  onCancel,
  subjectType = 'main',
  initialGrade,
}: GradeFormProps) => {
  const [value, setValue] = useState(initialGrade?.value.toString() || '');
  const [weight, setWeight] = useState(initialGrade?.weight.toString() || '1');
  const [type, setType] = useState<'oral' | 'written'>(initialGrade?.type || 'oral');
  const [notes, setNotes] = useState(initialGrade?.notes || '');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dob: initialGrade ? new Date(initialGrade.date) : new Date(),
    },
  });

  useEffect(() => {
    if (initialGrade) {
      setValue(initialGrade.value.toString());
      setWeight(initialGrade.weight.toString());
      setType(initialGrade.type);
      setNotes(initialGrade.notes || '');
      form.setValue('dob', new Date(initialGrade.date));
    }
  }, [initialGrade, form]);

  // If it's a secondary subject, force type to be 'oral'
  useEffect(() => {
    if (subjectType === 'secondary') {
      setType('oral');
    }
  }, [subjectType]);

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    onSubmit({
      value: Number(value),
      weight: Number(weight),
      type,
      date: data.dob.toISOString(),
      notes,
    });
    if (!initialGrade) {
      setValue('');
      setWeight('1');
      setType('oral');
      setNotes('');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="value">Note</Label>
            <Input
              id="value"
              type="number"
              min="1"
              max="6"
              step="0.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weight">Gewichtung</Label>
            <Input
              id="weight"
              type="number"
              min="0.5"
              max="3"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          {subjectType === 'main' && (
            <div className="grid gap-2">
              <Label>Art</Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as 'oral' | 'written')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oral" id="oral" />
                  <Label htmlFor="oral">Mündlich</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="written" id="written" />
                  <Label htmlFor="written">Schulaufgabe</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Datum</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP', { locale: de }) : <span>Datum auswählen</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionale Notizen zur Note..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
          )}
          <Button type="submit">
            {initialGrade ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </div>
      </form>
    </Form>
  );
};