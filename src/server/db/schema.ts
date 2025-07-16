
import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
export const quizzesTable = pgTable("quizzes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    quizId: integer().notNull().references(() => quizzesTable.id),
    questionText: varchar({ length: 255 }).notNull(),
    featureId: integer().notNull().references(() => quizFeaturesTable.id),
});

export const quizEventualitiesTable = pgTable("quiz_eventualities", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    quizId: integer().notNull().references(() => quizzesTable.id),
    name: varchar({ length: 255 }).notNull(),
});

export const quizFeaturesTable = pgTable("quiz_features", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    quizId: integer().notNull().references(() => quizzesTable.id),
    name: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 50 }).notNull(),
});

export const quizFeatureEventualitiesTable = pgTable("quiz_feature_eventualities", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    featureId: integer().notNull().references(() => quizFeaturesTable.id),
    eventualityId: integer().notNull().references(() => quizEventualitiesTable.id),
    affirmativePoints: integer().notNull(),
    negativePoints: integer().notNull(),
    type: varchar({ length: 50 }),
});

export const quizRelations = relations(quizzesTable, ({ many }) => ({
    quizQuestions: many(quizQuestionsTable),
    quizFeatures: many(quizFeaturesTable),
    quizEventualities: many(quizEventualitiesTable),
    quizFeatureEventualities: many(quizFeatureEventualitiesTable),
}));

export const quizFeaturesRelations = relations(quizFeaturesTable, ({ one, many }) => ({
    quiz: one(quizzesTable, {
        fields: [quizFeaturesTable.quizId],
        references: [quizzesTable.id],
    }),
    quizFeatureEventualities: many(quizFeatureEventualitiesTable),
}));

export const quizQuestionsRelations = relations(quizQuestionsTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [quizQuestionsTable.quizId],
        references: [quizzesTable.id],
    }),
}));

export const quizEventualitiesRelations = relations(quizEventualitiesTable, ({ one, many }) => ({
    quiz: one(quizzesTable, {
        fields: [quizEventualitiesTable.quizId],
        references: [quizzesTable.id],
    }),
    quizFeatureEventualities: many(quizFeatureEventualitiesTable),
}));

export const quizFeatureEventualitiesRelations = relations(quizFeatureEventualitiesTable, ({ one }) => ({
    quizFeature: one(quizFeaturesTable, {
        fields: [quizFeatureEventualitiesTable.featureId],
        references: [quizFeaturesTable.id],
    }),
    quizEventuality: one(quizEventualitiesTable, {
        fields: [quizFeatureEventualitiesTable.eventualityId],
        references: [quizEventualitiesTable.id],
    }),
}));