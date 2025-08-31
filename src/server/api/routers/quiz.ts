import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { quizzesTable, submissionsTable } from "@/server/db/schema";
import { ORPCError, os } from "@orpc/server";
import z from "zod";
import { FormSchema, QuizSchema } from "@/lib/schema";
import { update } from "@/server/updateCode";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { calcSubmissionResults } from "@/server/calcSubmissionResults";

const authMiddleware = os
  .$context<{ headers: Headers }>()
  .middleware(async ({ context, next }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    return next({ context: { ...context, session } });
  });

const base = os.$context<{ headers: Headers }>().use(authMiddleware);

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
  findMany: base.handler(async ({ context }) => {
    const session = context.session;
    const quizzes = await db.query.quizzesTable.findMany({
      where: eq(quizzesTable.user, session.user.id),
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
    return quizzes || [];
  }),
  submitResponse: base
    .input(z.object({ quizId: z.number(), answers: z.array(z.string()) }))
    .handler(async ({ input, context }) => {
      const session = context.session;
      const submission = await db
        .insert(submissionsTable)
        .values({
          quizId: input.quizId,
          answers: input.answers,
          user: session ? session.user.id : "anon",
        })
        .returning();
      return submission[0].id;
    }),
  getSubmission: os
    .input(z.object({ submissionId: z.number() }))
    .handler(async ({ input }) => {
      // const session = context.session;
      const submission = await db.query.submissionsTable.findFirst({
        where: and(
          eq(submissionsTable.id, input.submissionId)
          // eq(submissionsTable.user, session.user.id)
        ),
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
        const newSubmission = calcSubmissionResults(submission);
        return newSubmission;
      } else {
        throw new ORPCError("UNAUTHORIZED");
      }
    }),
  getSubmissions: base.handler(async ({ context }) => {
    const session = context.session;
    const submissions = await db.query.submissionsTable.findMany({
      where: and(eq(submissionsTable.user, session.user.id)),
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
    if (submissions && submissions.length > 0) {
      const newSubmissions = [];
      for (const submission of submissions) {
        const newSubmission = await calcSubmissionResults(submission);
        newSubmissions.push(newSubmission);
      }
      return newSubmissions;
    } else {
      return [];
    }
  }),
  createBlank: base.handler(async () => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const response = await db
        .insert(quizzesTable)
        .values({
          title: "",
          description: "",
          user: session ? session.user.id : "anon",
        })
        .returning();
      return response[0].id;
    } catch (e) {
      console.log("Error creating a quiz: ", e);
    }
  }),
  update: base
    .input(z.object({ quizId: z.int(), formData: FormSchema }))
    .handler(async ({ input, context }) => {
      try {
        const session = context.session;
        update(input, session.user);
      } catch (e) {
        if (e instanceof Error && e.message == "Unauthorized") {
          throw new ORPCError("UNAUTHORIZED");
        }
        console.log("error creating quiz in server: ", e);
        return "-";
      }
    }),
};
