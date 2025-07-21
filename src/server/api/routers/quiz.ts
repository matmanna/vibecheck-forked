import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { quizzesTable, submissionsTable } from "@/server/db/schema";
import { os } from "@orpc/server";
import { QuizSchema } from "@/server/schema";
import z from "zod";

export const quizRouter = {
  find: os.input(QuizSchema.pick({ id: true })).handler(async ({ input }) => {
    const quiz = await db.query.quizzesTable.findFirst({
      where: eq(quizzesTable.id, input.id),
      with: {
        quizFeatures: {
          with: {
            quizFeatureEventualities: true,
          },
        },
        quizQuestions: true,
        quizEventualities: true,
      },
    });
    return quiz || null;
  }),
  findAll: os.handler(async () => {
    const quizzes = await db.query.quizzesTable.findMany();
    return quizzes;
  }),
  submitResponse: os
    .input(z.object({ quizId: z.number(), answers: z.array(z.string()) }))
    .handler(async ({ input }) => {
      const submission = await db
        .insert(submissionsTable)
        .values({
          quizId: input.quizId,
          answers: input.answers,
        })
        .returning();
      return submission[0].id;
    }),
  getSubmission: os
    .input(z.object({ submissionId: z.number() }))
    .handler(async ({ input }) => {
      const submission = await db.query.submissionsTable.findFirst({
        where: eq(submissionsTable.id, input.submissionId),
        with: {
          quiz: {
            with: {
              quizFeatures: {
                with: {
                  quizFeatureEventualities: true,
                },
              },
              quizQuestions: true,
              quizEventualities: true,
            },
          },
        },
      });
      if (submission) {
        const eventualityScores = submission.quiz.quizEventualities.map(() => 0);
        submission.quiz.quizQuestions.forEach((question, index) => {
          const answer = submission.answers[index];
          const feature = submission.quiz.quizFeatures.find(
            (f) => f.id === question.featureId
          );
          if (feature) {
            feature.quizFeatureEventualities
              .filter((item) => item.featureId == feature.id)
              .forEach((linkRecord) => {
                if (answer === "yes") {
                  eventualityScores[
                    submission.quiz.quizEventualities
                      .map((item) => item.id)
                      .indexOf(linkRecord.eventualityId)
                  ] += linkRecord.affirmativePoints;
                } else if (answer === "no") {
                  eventualityScores[
                    submission.quiz.quizEventualities
                      .map((item) => item.id)
                      .indexOf(linkRecord.eventualityId)
                  ] += linkRecord.negativePoints;
                } else {
                  // no change in points
                }
              });
          }
        });
        return {
          ...submission,
          results: eventualityScores,
        };
      }
    }),
};
