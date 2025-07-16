
import * as z from 'zod'

export const QuizSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
})

export const FeatureSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  category: z.string(),
})