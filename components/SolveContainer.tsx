"use client";

import { useRouter } from "next/navigation";
import SolveFlow from "./SolveFlow";
import type { Question } from "@/lib/data";
import { useSaveLastResult } from "@/lib/storage";

interface Props {
  ticketId: number;
  questions: Question[];
}

export default function SolveContainer({ ticketId, questions }: Props) {
  const router = useRouter();
  const saveResult = useSaveLastResult();
  return (
    <SolveFlow
      questions={questions}
      title={`Билет ${ticketId}`}
      resultTitle={`Билет ${ticketId}`}
      onExit={() => router.push("/")}
      onComplete={(correct, total) =>
        saveResult(ticketId, {
          correct,
          total,
          dateIso: new Date().toISOString(),
        })
      }
    />
  );
}
