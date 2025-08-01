import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import {
  quizEventualitiesTable,
  quizFeatureEventualitiesTable,
  quizFeaturesTable,
  quizQuestionsTable,
  quizzesTable,
  submissionsTable,
} from "@/server/db/schema";
import { os } from "@orpc/server";
import { QuizSchema } from "@/server/schema";
import z from "zod";
import { FormSchema } from "@/lib/schema";

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
        const eventualityScores = submission.quiz.quizEventualities.map(
          () => 0
        );
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
  create: os
    .input(z.object({ formData: FormSchema }))
    .handler(async ({ input }) => {
      try {
        const quizCreated = await db
          .insert(quizzesTable)
          .values({
            title: input.formData.title,
            description: input.formData.description,
          })
          .returning();
        const newEventualities = input.formData.eventualities.map((item) => {
          return {
            quizId: quizCreated[0].id,
            name: item.name,
            resultDescription: item.resultDescription,
          };
        });
        const eventualitiesCreated = await db
          .insert(quizEventualitiesTable)
          .values(newEventualities)
          .returning();
        const newFeatures = input.formData.questions.map((item, idx) => {
          return {
            quizId: quizCreated[0].id,
            name: `feature_${idx.toString()}`,
            category: idx.toString(),
          };
        });
        const featuresCreated = await db
          .insert(quizFeaturesTable)
          .values(newFeatures)
          .returning();
        const newQuestions = input.formData.questions.map((item, idx) => {
          return {
            quizId: quizCreated[0].id,
            questionText: item.questionText,
            featureId: featuresCreated[idx].id,
          };
        });
        const questionsCreated = await db
          .insert(quizQuestionsTable)
          .values(newQuestions)
          .returning();
        const newLinkedRecords = [];
        for (let i = 0; i < questionsCreated.length; i++) {
          for (let i2 = 0; i2 < eventualitiesCreated.length; i2++) {
            newLinkedRecords.push({
              featureId: featuresCreated[i].id,
              eventualityId: eventualitiesCreated[i2].id,
              affirmativePoints: parseInt(
                input.formData.questionImpacts[i].outcomes[i2].affirmative
              ),
              negativePoints: parseInt(
                input.formData.questionImpacts[i].outcomes[i2].negative
              ),
              name: featuresCreated[i].name,
              impactType: null,
            });
          }
        }
        await db
          .insert(quizFeatureEventualitiesTable)
          .values(newLinkedRecords)
          .returning();
        return quizCreated[0].id;
      } catch (e) {
        console.log("error creating quiz in server: ", e);
        return "-";
      }
    }),
};
