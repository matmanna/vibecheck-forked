
import { db } from '@/server/db'
import { eq } from 'drizzle-orm'
import { quizzesTable } from '@/server/db/schema';
import { os } from '@orpc/server'
import { QuizSchema } from '@/server/schema'

export const quizRouter = {
    find: os
        .input(QuizSchema.pick({ id: true }))
        .handler(async ({ input }) => {

            const quiz = await db.query.quizzesTable.findFirst({
                where: eq(quizzesTable.id, input.id),
                with: {
                    quizFeatures: {
                        with: {
                            quizFeatureEventualities: true
                        },
                    },
                    quizQuestions: true,
                    quizEventualities: true,
                },
            });
            return quiz || null;
        }),
        findAll: os
        .handler(async () => {
            const quizzes = await db.query.quizzesTable.findMany();
            return quizzes;
        })
}