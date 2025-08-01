import z from "zod";

export const QuizQuestionsSchema = z.object({
  id: z.number().int(),
  quizId: z.number().int(),
  questionText: z.string(),
  featureId: z.number().int(),
});

export const QuizEventualitiesSchema = z.object({
  id: z.number().int(),
  quizId: z.number().int(),
  name: z.string(),
  resultDescription: z.string(),
});

export const QuizFeatureEventualitySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  featureId: z.number().int(),
  eventualityId: z.number().int(),
  affirmativePoints: z.number().int(),
  negativePoints: z.number().int(),
  impactType: z.string().nullable(),
});

export const QuizFeaturesSchema = z.object({
  id: z.number().int(),
  quizId: z.number().int(),
  name: z.string(),
  category: z.string(),
  quizFeatureEventualities: z.array(QuizFeatureEventualitySchema),
});

export const QuizSchema = z.object({
  id: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
  quizQuestions: z.array(QuizQuestionsSchema),
  quizFeatures: z.array(QuizFeaturesSchema),
  quizEventualities: z.array(QuizEventualitiesSchema),
});

export type QuizType = z.infer<typeof QuizSchema>;

// const FeaturesSchema = QuizFeaturesSchema.omit({
//   quizFeatureEventualities: true,
//   id: true,
//   quizId: true,
// });

const QuestionsSchema = QuizQuestionsSchema.omit({
  id: true,
  quizId: true,
  featureId: true,
});

const OutcomesSchema = QuizEventualitiesSchema.omit({
  id: true,
  quizId: true,
});

export const QuizImpactsSchema = z.object({
  outcomes: z.array(z.object({ affirmative: z.string(), negative: z.string() })),
});

export const FormSchema = QuizSchema.omit({
  id: true,
  quizFeatures: true,
  quizEventualities: true,
  quizQuestions: true,
})
  // .and(z.object({ features: z.array(FeaturesSchema) }))
  .and(z.object({ questions: z.array(QuestionsSchema) }))
  .and(z.object({ eventualities: z.array(OutcomesSchema) }))
  .and(
    z.object({
      questionImpacts: z.array(QuizImpactsSchema),
    })
  );
