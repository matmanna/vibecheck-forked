"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuizType } from "../lib/schema";

function compileTableData(quizData: QuizType, answers: string[]) {
  const eventualities = quizData.quizEventualities.map((item) => {
    return { id: item.id, name: item.name };
  });
  const questions = quizData.quizQuestions.map((item, idx) => {
    return {
      featureName: quizData.quizFeatures.find(
        (item2) => item2.id == item.featureId
      )?.name,
      points: quizData.quizEventualities.map((item2) =>
        answers[idx] == "yes"
          ? quizData.quizFeatures
              .find((item3) => item3.id == item.featureId)
              ?.quizFeatureEventualities.find((item4) => item4.eventualityId == item2.id)
              ?.affirmativePoints
          : answers[idx] == "no"
          ? quizData.quizFeatures
              .find((item3) => item3.id == item.featureId)
              ?.quizFeatureEventualities.find((item4) => item4.eventualityId == item2.id)
              ?.negativePoints
          : 0
      ),
    };
  });
  console.log(JSON.stringify(questions));
  return { eventualities: eventualities, questions: questions };
}

export default function ResultsTable({
  quizData,
  answers,
  results,
}: {
  quizData: QuizType;
  answers: string[];
  results: number[];
}) {
  const tableData = compileTableData(quizData, answers);

  return (
    <Table>
      <TableCaption>
        Points given to each outcome based on your answers.<br></br>Positive points indicate the outcome is better given your answer.<br></br>Negative points indicate the outcome is worse given your answer.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Question</TableHead>
          <TableHead className="w-[100x] text-center">Answer</TableHead>
          {tableData.eventualities.map((item) => (
            <TableHead className="text-center" key={`${item.id}-tablehead`}>{item.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.questions.map((item, idx) => {
          return (
            <TableRow key={`q${idx}-row`}>
              <TableCell className="font-medium text-center">{item.featureName}</TableCell>
              <TableCell className="font-medium text-center">
                {answers[idx] == "neutral"
                  ? "-"
                  : answers[idx][0].toUpperCase()}
              </TableCell>
              {tableData.questions[idx].points.map((item2, idx2) => (
                <TableCell className="text-center" key={`q${idx}-${idx2}-points`}>{item2}</TableCell>
              ))}
            </TableRow>
          );
        })}
        <TableRow key={`total-row`}>
          <TableCell colSpan={2} className="font-medium text-right">Total:</TableCell>
          {results.map((item2, idx2) => (
            <TableCell className="text-center" key={`totalcell-${idx2}`}>{results[idx2]}</TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
}
