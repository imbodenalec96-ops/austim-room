export type Role = "teacher" | "para" | "admin" | "parent" | "student_device";

export type PecsCategory =
  | "needs"
  | "feelings"
  | "actions"
  | "people"
  | "places"
  | "social"
  | "sensory";

export type RequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "denied"
  | "redirected";

export interface Classroom {
  id: string;
  name: string;
  created_at: string;
}

export interface Student {
  id: string;
  classroom_id: string;
  full_name: string;
  photo_url: string | null;
  grade: string | null;
  communication_mode: string | null;
  prompt_hierarchy: string[] | null;
  sensory_supports: string[] | null;
  reinforcers: string[] | null;
  triggers: string | null;
  academic_levels: Record<string, string> | null;
  goals: string[] | null;
  created_at: string;
}

export interface ScheduleBlock {
  id: string;
  classroom_id: string;
  student_id: string | null;
  title: string;
  icon: string | null;
  color: string | null;
  starts_at: string;
  ends_at: string;
  day_of_week: number;
  slide_url: string | null;
  notes: string | null;
  staff: string | null;
  sort_order: number;
}

export interface PecsIcon {
  id: string;
  label: string;
  category: PecsCategory;
  emoji: string | null;
  image_url: string | null;
  audio_url: string | null;
  sort_order: number;
}

export interface PecsRequest {
  id: string;
  student_id: string;
  icon_id: string;
  status: RequestStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  notes: string | null;
}

export interface Assignment {
  id: string;
  student_id: string;
  title: string;
  domain: string | null;
  difficulty: number | null;
  support_level: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      classrooms: {
        Row: Classroom;
        Insert: Omit<Classroom, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Classroom>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Student>;
      };
      schedule_blocks: {
        Row: ScheduleBlock;
        Insert: Omit<ScheduleBlock, "id"> & { id?: string };
        Update: Partial<ScheduleBlock>;
      };
      pecs_icons: {
        Row: PecsIcon;
        Insert: Omit<PecsIcon, "id"> & { id?: string };
        Update: Partial<PecsIcon>;
      };
      pecs_requests: {
        Row: PecsRequest;
        Insert: Omit<PecsRequest, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<PecsRequest>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Assignment>;
      };
    };
  };
}
