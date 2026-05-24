import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Question } from "./data";

export const getAllQuestionsServer = cache(async (): Promise<Question[]> => {
  const file = path.join(process.cwd(), "public", "questions.json");
  const content = await fs.readFile(file, "utf8");
  return JSON.parse(content) as Question[];
});
