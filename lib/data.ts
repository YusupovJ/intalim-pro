export interface Answer {
  id: number;
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  lang_id: number;
  lesson_id: number;
  text: string;
  image: string | null;
  answers: Answer[];
  explanation: string | null;
  video: string | null;
  static_order: boolean;
  is_new: boolean;
  old_templates: number[];
  edu_types: string[];
  tickets: number[];
}

export const IMG_BASE = "https://back.eavtotalim.uz";
