export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          earned_at: string | null
          id: string
          school_year: number
          subject_id: string | null
          type: Database["public"]["Enums"]["achievement_type"]
          user_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          school_year: number
          subject_id?: string | null
          type: Database["public"]["Enums"]["achievement_type"]
          user_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          school_year?: number
          subject_id?: string | null
          type?: Database["public"]["Enums"]["achievement_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_access: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      archived_grades: {
        Row: {
          archived_subject_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          original_grade_id: string
          type: string
          value: number
          weight: number
        }
        Insert: {
          archived_subject_id: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          original_grade_id: string
          type: string
          value: number
          weight: number
        }
        Update: {
          archived_subject_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          original_grade_id?: string
          type?: string
          value?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "archived_grades_archived_subject_id_fkey"
            columns: ["archived_subject_id"]
            isOneToOne: false
            referencedRelation: "archived_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      archived_subjects: {
        Row: {
          archived_at: string
          created_at: string
          grade_level: number
          id: string
          name: string
          original_subject_id: string
          type: string
          user_id: string
          written_weight: number | null
        }
        Insert: {
          archived_at?: string
          created_at?: string
          grade_level: number
          id?: string
          name: string
          original_subject_id: string
          type: string
          user_id: string
          written_weight?: number | null
        }
        Update: {
          archived_at?: string
          created_at?: string
          grade_level?: number
          id?: string
          name?: string
          original_subject_id?: string
          type?: string
          user_id?: string
          written_weight?: number | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          subject_id: string
          type: string
          value: number
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          subject_id: string
          type: string
          value: number
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          subject_id?: string
          type?: string
          value?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          grade_level: number
          id: string
          role: string
          school_id: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          grade_level?: number
          id: string
          role?: string
          school_id?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          grade_level?: number
          id?: string
          role?: string
          school_id?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          grade_level: number
          id: string
          name: string
          school_id: string | null
          type: string
          user_id: string
          written_weight: number | null
        }
        Insert: {
          created_at?: string
          grade_level?: number
          id?: string
          name: string
          school_id?: string | null
          type: string
          user_id: string
          written_weight?: number | null
        }
        Update: {
          created_at?: string
          grade_level?: number
          id?: string
          name?: string
          school_id?: string | null
          type?: string
          user_id?: string
          written_weight?: number | null
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          created_at: string
          grade_level: number
          id: string
          school_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          grade_level: number
          id?: string
          school_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          grade_level?: number
          id?: string
          school_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          email: string
          password: string
          first_name: string
          grade_level?: number
          school_id?: string
        }
        Returns: string
      }
      archive_subjects_for_user: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
      check_admin_password: {
        Args: {
          input_password: string
        }
        Returns: boolean
      }
      get_school_subject_averages: {
        Args: {
          school_uuid: string
          grade_level_param: number
        }
        Returns: {
          subject_name: string
          average_grade: number
          student_count: number
        }[]
      }
      get_school_year: {
        Args: {
          check_date: string
        }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_admin_password: {
        Args: {
          new_password: string
        }
        Returns: undefined
      }
    }
    Enums: {
      achievement_type:
        | "first_grade"
        | "grade_streak"
        | "perfect_grade"
        | "improvement"
        | "subject_master"
        | "grade_collector"
        | "subject_collector"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
