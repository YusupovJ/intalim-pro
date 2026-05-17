"use client";

import { useEffect, useState } from "react";

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
  templates: number[];
  edu_types: string[];
}

export const IMG_BASE = "https://back.eavtotalim.uz";

let cache: Question[] | null = null;
let pending: Promise<Question[]> | null = null;

export function loadQuestions(): Promise<Question[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/questions.json")
      .then((r) => r.json() as Promise<Question[]>)
      .then((data) => {
        cache = data;
        pending = null;
        return data;
      });
  }
  return pending;
}

export function useQuestions(): Question[] | null {
  const [data, setData] = useState<Question[] | null>(cache);
  useEffect(() => {
    if (cache) {
      if (data !== cache) setData(cache);
      return;
    }
    let active = true;
    loadQuestions().then((qs) => {
      if (active) setData(qs);
    });
    return () => {
      active = false;
    };
  }, [data]);
  return data;
}
