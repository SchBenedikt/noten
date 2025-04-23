
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Grade } from '@/types';
import { GradeValueInput } from './grade/GradeValueInput';
import { GradeWeightInput } from './grade/GradeWeightInput';
import { GradeTypeSelector } from './grade/GradeTypeSelector';
import { GradeDatePicker } from './grade/GradeDatePicker';
import { GradeNotesInput } from './grade/GradeNotesInput';
import { toast } from '@/components/ui/use-toast';

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
  const [type, setType] = useState<'oral' | 'written'>(
    initialGrade?.type || (subjectType === 'secondary' ? 'oral' : 'oral')
  );
  const [notes, setNotes] = useState(initialGrade?.notes || '');
  const [valueError, setValueError] = useState(false);
  const [weightError, setWeightError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (subjectType === 'secondary' && type === 'written') {
      setType('oral');
    }
  }, [subjectType, type]);

  const validateInputs = () => {
    let isValid = true;
    
    // Validate value
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 1 || numericValue > 6) {
      setValueError(true);
      isValid = false;
    } else {
      setValueError(false);
    }
    
    // Validate weight
    const numericWeight = Number(weight);
    if (isNaN(numericWeight) || numericWeight < 0.5 || numericWeight > 3) {
      setWeightError(true);
      isValid = false;
    } else {
      setWeightError(false);
    }
    
    return isValid;
  };

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!validateInputs()) {
      toast({
        title: "Eingabefehler",
        description: "Bitte überprüfe deine Eingaben",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const numericValue = Number(value);
      const numericWeight = Number(weight);
      
      await onSubmit({
        value: numericValue,
        weight: numericWeight,
        type,
        date: data.dob.toISOString(),
        notes,
      });
      
      // Reset form only if not editing an existing grade
      if (!initialGrade) {
        setValue('');
        setWeight('1');
        setType('oral');
        setNotes('');
        form.reset({
          dob: new Date(),
        });
      }
      
      toast({
        title: initialGrade ? "Note aktualisiert" : "Note hinzugefügt",
        description: initialGrade ? "Die Note wurde erfolgreich aktualisiert" : "Die Note wurde erfolgreich hinzugefügt",
      });
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast({
        title: "Fehler",
        description: "Beim Speichern der Note ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <GradeValueInput value={value} onChange={setValue} hasError={valueError} />
          <GradeWeightInput weight={weight} onChange={setWeight} hasError={weightError} />
          <GradeTypeSelector 
            type={type} 
            onChange={setType} 
            subjectType={subjectType}
          />
          <GradeDatePicker form={form} />
          <GradeNotesInput notes={notes} onChange={setNotes} />
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Abbrechen
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert..." : (initialGrade ? "Speichern" : "Hinzufügen")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
