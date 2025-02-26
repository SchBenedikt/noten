
import { supabase } from '@/integrations/supabase/client';
import { Subject, Grade } from '@/types';
import { DatabaseSubject } from '@/types/database';
import { SubjectType } from '@/types';

export const SubjectsService = {
  async fetchSubjects() {
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        type,
        written_weight,
        user_id,
        created_at,
        grade_level,
        grades (
          id,
          subject_id,
          value,
          weight,
          type,
          date,
          created_at,
          notes
        )
      `)
      .order('created_at', { ascending: true });

    if (subjectsError) throw subjectsError;
    return subjectsData as DatabaseSubject[];
  },

  async createSubject(newSubject: Omit<Subject, 'id' | 'grades'>, userId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: newSubject.name,
        type: newSubject.type as SubjectType,
        written_weight: newSubject.writtenWeight,
        grade_level: newSubject.grade_level,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addGrade(subjectId: string, grade: Omit<Grade, 'id'>) {
    const { data, error } = await supabase
      .from('grades')
      .insert({
        subject_id: subjectId,
        value: grade.value,
        weight: grade.weight,
        type: grade.type,
        date: grade.date,
        notes: grade.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGrade(gradeId: string, updatedGrade: Omit<Grade, 'id'>) {
    const { error } = await supabase
      .from('grades')
      .update({
        value: updatedGrade.value,
        weight: updatedGrade.weight,
        type: updatedGrade.type,
        date: updatedGrade.date,
        notes: updatedGrade.notes,
      })
      .eq('id', gradeId);

    if (error) throw error;
  },

  async deleteGrade(gradeId: string) {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);

    if (error) throw error;
  },

  async deleteSubject(subjectId: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) throw error;
  },

  async updateSubject(subjectId: string, updates: { writtenWeight?: number }) {
    const { error } = await supabase
      .from('subjects')
      .update({
        written_weight: updates.writtenWeight,
      })
      .eq('id', subjectId);

    if (error) throw error;
  }
};
