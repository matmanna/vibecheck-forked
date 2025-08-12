import z from "zod";
import {
  quizEventualitiesTable,
  quizFeatureEventualitiesTable,
  quizFeaturesTable,
  quizQuestionsTable,
  quizzesTable,
} from "./db/schema";
import {
  FormSchema,
  QuizFeatureEventualitySchema,
  QuizFeaturesSchema,
} from "@/lib/schema";
import { db } from "./db";
import { and, eq } from "drizzle-orm";

const inputSchema = z.object({ quizId: z.int(), formData: FormSchema });

export async function update(input: z.infer<typeof inputSchema>) {
  const origQuiz = await db.query.quizzesTable.findFirst({
    where: eq(quizzesTable.id, input.quizId),
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
  if (origQuiz) {
    if (
      input.formData.eventualities.length > 0 &&
      input.formData.questions.length > 0
    ) {
      // basic quiz data
      if (
        input.formData.title != origQuiz.title ||
        input.formData.description != origQuiz?.description
      ) {
        await db
          .update(quizzesTable)
          .set({
            title: input.formData.title,
            description: input.formData.description,
          })
          .where(eq(quizzesTable.id, input.quizId))
          .returning();
      }
      // eventaulities
      const newEventualities = input.formData.eventualities.map((item) => {
        return {
          id: item.id,
          quizId: input.quizId,
          name: item.name,
          resultDescription: item.resultDescription,
        };
      });
      const eventualitiesCreated = [];
      for (let i = 0; i < newEventualities.length; i++) {
        const alreadyExists =
          origQuiz.quizEventualities.filter(
            (item) => item.id == newEventualities[i].id
          ).length > 0;
        if (alreadyExists) {
          const newRecord = await db
            .update(quizEventualitiesTable)
            .set({
              quizId: input.quizId,
              name: newEventualities[i].name,
              resultDescription: newEventualities[i].resultDescription,
            })
            .where(eq(quizEventualitiesTable.id, newEventualities[i].id))
            .returning();
          eventualitiesCreated.push(newRecord[0]);
        } else {
          const newRecord = await db
            .insert(quizEventualitiesTable)
            .values({
              quizId: input.quizId,
              name: newEventualities[i].name,
              resultDescription: newEventualities[i].resultDescription,
            })
            .returning();
          eventualitiesCreated.push(newRecord[0]);
        }
      }
      console.log(
        "eventualities created: ",
        eventualitiesCreated.map((item) => item.id)
      );
      // new features
      const newFeatures = input.formData.questions.map((item, idx) => {
        const randFeatureName = idx;
        return {
          id: item.featureId,
          quizId: input.quizId,
          name: `feature_${randFeatureName.toString()}`,
          category: randFeatureName.toString(),
        };
      });
      const featureCreatedType = z.array(
        QuizFeaturesSchema.omit({ quizFeatureEventualities: true })
      );
      const featuresCreated: z.infer<typeof featureCreatedType> = [];
      for (let i = 0; i < newFeatures.length; i++) {
        const alreadyExists =
          origQuiz.quizFeatures.filter((item) => item.id == newFeatures[i].id)
            .length > 0;
        if (alreadyExists) {
          const newRecord = await db
            .update(quizFeaturesTable)
            .set({
              quizId: newFeatures[i].quizId,
              name: newFeatures[i].name,
              category: newFeatures[i].category,
            })
            .where(eq(quizFeaturesTable.id, newFeatures[i].id))
            .returning();
          featuresCreated.push(newRecord[0]);
        } else {
          const newRecord = await db
            .insert(quizFeaturesTable)
            .values({
              quizId: newFeatures[i].quizId,
              name: newFeatures[i].name,
              category: newFeatures[i].category,
            })
            .returning();
          featuresCreated.push(newRecord[0]);
        }
      }
      console.log(
        "features created: ",
        featuresCreated.map((item) => item.id)
      );
      // questions
      const newQuestions = input.formData.questions.map((item, idx) => {
        const featureId = featuresCreated[idx].id;
        return {
          id: item.id,
          quizId: input.quizId,
          questionText: item.questionText,
          featureId:
            featuresCreated !== undefined && featureId !== undefined
              ? featureId
              : 0,
        };
      });
      const questionsCreated = [];
      for (let i = 0; i < newQuestions.length; i++) {
        const alreadyExists =
          origQuiz.quizQuestions.filter((item) => item.id == newQuestions[i].id)
            .length > 0;
        if (alreadyExists) {
          const newRecord = await db
            .update(quizQuestionsTable)
            .set({
              quizId: newQuestions[i].quizId,
              questionText: newQuestions[i].questionText,
              featureId: newQuestions[i].featureId,
            })
            .where(eq(quizQuestionsTable.id, newQuestions[i].id))
            .returning();
          await db
            .update(quizFeaturesTable)
            .set({
              name: "feature_" + newRecord[0].id,
            })
            .where(eq(quizFeaturesTable.id, newRecord[i].featureId))
            .returning();
          questionsCreated.push(newRecord[0]);
        } else {
          const newRecord = await db
            .insert(quizQuestionsTable)
            .values({
              quizId: newQuestions[i].quizId,
              questionText: newQuestions[i].questionText,
              featureId: newQuestions[i].featureId,
            })
            .returning();
          questionsCreated.push(newRecord[0]);
        }
      }
      console.log("questions created: ", questionsCreated);
      // linked records
      const NewLinkSchema = QuizFeatureEventualitySchema.omit({ id: true });
      const newLinkedRecords: z.infer<typeof NewLinkSchema>[] = [];
      for (let i = 0; i < questionsCreated.length; i++) {
        for (let i2 = 0; i2 < eventualitiesCreated.length; i2++) {
          newLinkedRecords.push({
            featureId: questionsCreated[i].featureId,
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
      console.log("to create linked: ", newLinkedRecords);
      const linkedRecordsCreated = [];
      for (let i = 0; i < newLinkedRecords.length; i++) {
        const alreadyExists =
          origQuiz.quizFeatures.filter(
            (item) => item.id == newLinkedRecords[i].featureId
          ).length > 0 &&
          origQuiz.quizFeatures
            .filter((item) => item.id == newLinkedRecords[i].featureId)[0]
            .quizFeatureEventualities.filter(
              (item) => item.eventualityId == newLinkedRecords[i].eventualityId
            ).length > 0;
        if (alreadyExists) {
          const newRecord = await db
            .update(quizFeatureEventualitiesTable)
            .set({
              featureId: newLinkedRecords[i].featureId,
              eventualityId: newLinkedRecords[i].eventualityId,
              affirmativePoints: newLinkedRecords[i].affirmativePoints,
              negativePoints: newLinkedRecords[i].negativePoints,
              name: newLinkedRecords[i].name,
              impactType: newLinkedRecords[i].impactType,
            })
            .where(
              and(
                eq(
                  quizFeatureEventualitiesTable.featureId,
                  newLinkedRecords[i].featureId
                ),
                eq(
                  quizFeatureEventualitiesTable.eventualityId,
                  newLinkedRecords[i].eventualityId
                )
              )
            )
            .returning();
          linkedRecordsCreated.push(newRecord[0]);
        } else {
          const newRecord = await db
            .insert(quizFeatureEventualitiesTable)
            .values({
              featureId: newLinkedRecords[i].featureId,
              eventualityId: newLinkedRecords[i].eventualityId,
              affirmativePoints: newLinkedRecords[i].affirmativePoints,
              negativePoints: newLinkedRecords[i].negativePoints,
              name: newLinkedRecords[i].name,
              impactType: newLinkedRecords[i].impactType,
            })
            .returning();
          linkedRecordsCreated.push(newRecord[0]);
        }
      }
      console.log(
        "linked created: ",
        linkedRecordsCreated.map((item) => item.id)
      );
      return input.quizId;
    }
  }
}
