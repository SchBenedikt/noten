
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

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    const numericValue = Number(value);
    const numericWeight = Number(weight);
    
    if (isNaN(numericValue) || isNaN(numericWeight)) {
      return;
    }
    
    onSubmit({
      value: numericValue,
      weight: numericWeight,
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
          <GradeValueInput value={value} onChange={setValue} />
          <GradeWeightInput weight={weight} onChange={setWeight} />
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialGrade ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
