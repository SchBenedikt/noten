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
        Args: { user_uuid: string }
        Returns: undefined
      }
      check_admin_password: {
        Args: { input_password: string }
        Returns: boolean
      }
      get_school_subject_averages: {
        Args: { school_uuid: string; grade_level_param: number }
        Returns: {
          subject_name: string
          average_grade: number
          student_count: number
        }[]
      }
      get_school_year: {
        Args: { check_date: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_admin_password: {
        Args: { new_password: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_type: [
        "first_grade",
        "grade_streak",
        "perfect_grade",
        "improvement",
        "subject_master",
        "grade_collector",
        "subject_collector",
      ],
    },
  },
} as const
