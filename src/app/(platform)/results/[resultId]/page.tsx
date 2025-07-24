"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/lib/orpc";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PointsChart from "@/components/PointsChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ResultsTable from "@/components/ResultsTable";

type ParamsType = {
  resultId: string;
};

export default function ResultsPage() {
  const resultId = parseInt(useParams<ParamsType>().resultId);
  const [winningEventualities, setWinningEventualities] = useState<number[]>(
    []
  );

  const { isLoading, data: submissionData } = useQuery(
    orpc.quiz.getSubmission.queryOptions({
      input: { submissionId: resultId },
      onError: (error: ORPCError<string, unknown>) => {
        console.error("Error fetching quiz:", error);
      },
    })
  );

  if (!isLoading && winningEventualities.length == 0 && submissionData) {
    let maxPoints = submissionData.results[0];
    for (let i = 0; i < submissionData.results.length; i++) {
      if (submissionData.results[i] > maxPoints) {
        maxPoints = submissionData.results[i];
      }
    }
    const winners = submissionData.quiz.quizEventualities.filter(
      (item, idx) => submissionData.results[idx] == maxPoints
    );
    setWinningEventualities(winners.map((item) => item.id));
  }

  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col gap-4 max-w-md">
          {isLoading && <RotateCw className="animate-spin self-center" />}
          {(!isLoading && submissionData) && (
            <>
              <p>
                Quiz:{" "}
                <Link
                  className="italic underline active-link"
                  href={`/quiz/${submissionData?.quiz.id}`}
                >
                  {submissionData?.quiz.title}
                </Link>
              </p>
              <Card className="min-w-md gap-2">
                <>
                  <CardHeader className="justify-center items-center">
                    <CardTitle>Results...</CardTitle>
                  </CardHeader>
                  <CardContent className="items-center justify-center">
                    <h1 className="text-3xl text-center">
                      {submissionData?.quiz.quizEventualities
                        .filter((item) =>
                          winningEventualities.includes(item.id)
                        )
                        .map((item) => item.name)
                        .join(", ")}
                    </h1>
                  </CardContent>
                </>
              </Card>
              <Accordion type="single" collapsible className="w-full max-w-xl">
                <AccordionItem value="item-1">
                  <AccordionTrigger>More info</AccordionTrigger>
                  <AccordionContent className="bg-[var(--background)]">
                    <div className="gap-2 flex flex-col">
                      {submissionData?.quiz.quizEventualities
                        .filter((item) =>
                          winningEventualities.includes(item.id)
                        )
                        .map((item) => {
                          return (
                            <CardDescription
                              className="text-justify"
                              key={item.id + "-description"}
                            >
                              {item.resultDescription}
                            </CardDescription>
                          );
                        })}
                    </div>
                    {submissionData && (
                      <div className="mt-6">
                        <PointsChart
                          eventualityNames={submissionData?.quiz.quizEventualities
                            .toSorted(
                              (a, b) =>
                                submissionData?.results[
                                  submissionData?.quiz.quizEventualities.indexOf(
                                    b
                                  )
                                ] -
                                submissionData?.results[
                                  submissionData?.quiz.quizEventualities.indexOf(
                                    a
                                  )
                                ]
                            )
                            .map((item) => item.name)}
                          results={submissionData?.results.toSorted(
                            (a, b) => b - a
                          )}
                        ></PointsChart>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-full max-w-xl">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Answers</AccordionTrigger>
                  <AccordionContent className="bg-[var(--background)]">
                    <div className="flex flex-col gap-1">
                      {submissionData?.quiz.quizQuestions.map((item, idx) => {
                        return (
                          <div
                            key={item.id + "-q"}
                            className="flex flex-row  gap-2"
                          >
                            <p key={item.id + "-qt"}>
                              {item.questionText}{" "}
                              <span
                                className="text-gray-500"
                                key={item.id + "-qa"}
                              >
                                {submissionData?.answers[idx]
                                  .charAt(0)
                                  .toUpperCase() +
                                  submissionData?.answers[idx].slice(1)}
                              </span>{" "}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-full max-w-xl">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Why You Got This Result</AccordionTrigger>
                  <AccordionContent className="bg-[var(--background)]">
                    <ResultsTable quizData={submissionData?.quiz} answers={submissionData?.answers} results={submissionData?.results}></ResultsTable>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
