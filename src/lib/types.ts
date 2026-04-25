export type Role = "teacher" | "para" | "admin" | "parent" | "student_device";

export type PecsCategory =
  | "carrier"          // sentence-starter phrases: "I want", "I see", "I feel"…
  | "pronouns"         // I / you / we / he / she / they / me / my
  | "needs"            // basic needs / requests
  | "feelings"         // emotion words
  | "actions"          // verbs / activities
  | "people"           // mom / dad / teacher / friend
  | "places"           // home / classroom / playground
  | "social"           // yes / no / please / stop / help
  | "sensory"          // calm corner / fidget / headphones
  | "transportation"   // car / bus / airplane / ship
  | "food"             // apple / pizza / sandwich
  | "care"             // brush teeth / wash hands / bath
  | "school"           // pencil / paper / book / scissors
  | "subjects"         // reading / math / writing / PE / music / art
  | "body"             // head / eyes / ears / nose / hands / feet
  | "clothing"         // shirt / pants / shoes / socks / jacket / hat
  | "weather"          // sunny / cloudy / rainy / snowy / windy
  | "time"             // now / later / first / then / morning / night
  | "rewards";         // sticker / prize box / token / puzzle

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
  carrier: string | null;
}

// ---------- Matching Boards --------------------------------------------

export type BoardKind =
  | "colors"
  | "shapes"
  | "count"
  | "alphabet"
  | "weather"
  | "sort"
  | "picture-word"
  | "face-parts"
  | "transportation"
  | "fruits-veg"
  | "planets"
  | "dinosaurs";

export type FeedbackMode = "instant" | "delayed" | "none";

export interface BoardSettings {
  errorless: boolean;
  audioOnTap: boolean;
  soundOnCorrect: boolean;
  feedbackOn: FeedbackMode;
  showLabels: boolean;
}

export interface BoardZone {
  id: string;
  label: string;
  kind?: "default" | "large";
  color?: string;
  emoji?: string;
  image_url?: string;
}

export interface BoardTile {
  id: string;
  label: string;
  color?: string;
  emoji?: string;
  count?: number;
  image_url?: string;
  audio_url?: string;
  correctZoneId: string;
}

export interface BoardLayout {
  settings: BoardSettings;
  zones: BoardZone[];
  tiles: BoardTile[];
}

export interface Board {
  id: string;
  classroom_id: string;
  title: string;
  kind: BoardKind;
  background: string | null;
  layout: BoardLayout;
  created_by: string | null;
  created_at: string;
}

export interface BoardAttempt {
  id: string;
  board_id: string;
  student_id: string;
  completed: boolean;
  correct_count: number;
  incorrect_count: number;
  duration_sec: number;
  prompt_level: string | null;
  independence_level: number | null;
  errorless: boolean;
  audio_used: boolean;
  notes: string | null;
  created_at: string;
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
