"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/lib/orpc";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { Pin, RotateCw } from "lucide-react";
import { useRef } from "react";

export default function QuizPage() {
  const scrollBox = useRef<HTMLDivElement>(null);

  const { isLoading, data: quizData } = useQuery(
    orpc.quiz.find.queryOptions({
      input: { id: 1 },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching quiz:", error);
      },
    })
  );

  return (
    <div ref={scrollBox} className="h-screen scroll-smooth snap-x snap-mandatory py-6 flex flex-row gap-[10vw] md:gap-[calc(25%-111px)] items-center w-full overflow-y-hidden overflow-x-scroll h-full w-full">
      <div className="snap-start h-0 w-0"></div>
      <div className="h-0 w-0"></div>

      <Card className="min-w-md flex-grow-1">
        <CardHeader>
          {isLoading ? <RotateCw className="animate-spin" /> : null}
          <div className="flex flex-row items-center gap-2">
            <Pin className="w-5 h-5" />
            <CardTitle>{quizData?.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>{quizData?.description}</p>
          <div className="flex flex-row items-center justify-end mt-4">
            <Button onClick={() => {
                scrollBox.current!.scrollBy({ left: 400, behavior: "smooth" });
              }}
            >Take Quiz</Button>
          </div>
        </CardContent>
      </Card>
                <div className="snap-start h-1 w-0"></div>


      {quizData?.quizQuestions.map((question, questionIndex) => (
        <>
          <div className={`${questionIndex > 0 ? "snap-start" : ""} h-1 w-0`}></div>

          <Card key={question.id} className="min-w-md flex-grow-1">
            <CardHeader>
              <CardTitle>Question {questionIndex + 1}:</CardTitle>
              <CardDescription>{question.questionText}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
          <div className="h-0 w-0"></div>
        </>
      ))}
      <div className="h-0 w-0"></div>
    </div>
  );
}
