import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const quizzesTable = pgTable("quizzes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  user: text()
    .notNull()
    .references(() => user.id),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  questionText: varchar({ length: 255 }).notNull(),
  featureId: integer()
    .notNull()
    .references(() => quizFeaturesTable.id),
});

export const quizEventualitiesTable = pgTable("quiz_eventualities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  name: varchar({ length: 255 }).notNull(),
  resultDescription: varchar({ length: 400 }).notNull(),
});

export const quizFeaturesTable = pgTable("quiz_features", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 50 }).notNull(),
});

export const quizFeatureEventualitiesTable = pgTable(
  "quiz_feature_eventualities",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    featureId: integer()
      .notNull()
      .references(() => quizFeaturesTable.id),
    eventualityId: integer()
      .notNull()
      .references(() => quizEventualitiesTable.id),
    affirmativePoints: integer().notNull(),
    negativePoints: integer().notNull(),
    impactType: varchar({ length: 50 }),
  }
);

export const submissionsTable = pgTable("submissions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: integer()
    .notNull()
    .references(() => quizzesTable.id),
  answers: varchar({ length: 255 }).array().notNull(),
  user: text()
    .notNull()
    .references(() => user.id),
});

export const quizRelations = relations(quizzesTable, ({ many }) => ({
  quizQuestions: many(quizQuestionsTable),
  quizFeatures: many(quizFeaturesTable),
  quizEventualities: many(quizEventualitiesTable),
  submissions: many(submissionsTable),
}));

export const quizFeaturesRelations = relations(
  quizFeaturesTable,
  ({ one, many }) => ({
    quiz: one(quizzesTable, {
      fields: [quizFeaturesTable.quizId],
      references: [quizzesTable.id],
    }),
    quizFeatureEventualities: many(quizFeatureEventualitiesTable),
  })
);

export const quizQuestionsRelations = relations(
  quizQuestionsTable,
  ({ one }) => ({
    quiz: one(quizzesTable, {
      fields: [quizQuestionsTable.quizId],
      references: [quizzesTable.id],
    }),
  })
);

export const quizEventualitiesRelations = relations(
  quizEventualitiesTable,
  ({ one, many }) => ({
    quiz: one(quizzesTable, {
      fields: [quizEventualitiesTable.quizId],
      references: [quizzesTable.id],
    }),
    quizFeatureEventualities: many(quizFeatureEventualitiesTable),
  })
);

export const quizFeatureEventualitiesRelations = relations(
  quizFeatureEventualitiesTable,
  ({ one }) => ({
    quizFeature: one(quizFeaturesTable, {
      fields: [quizFeatureEventualitiesTable.featureId],
      references: [quizFeaturesTable.id],
    }),
    quizEventuality: one(quizEventualitiesTable, {
      fields: [quizFeatureEventualitiesTable.eventualityId],
      references: [quizEventualitiesTable.id],
    }),
  })
);

export const submissionsRelations = relations(submissionsTable, ({ one }) => ({
  quiz: one(quizzesTable, {
    fields: [submissionsTable.quizId],
    references: [quizzesTable.id],
  }),
}));
