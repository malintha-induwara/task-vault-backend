import { z } from "zod";

export const createTodoSchema = z.object({
  body: z.object({
    task: z.string().min(1, "Todo task cannot be empty"),
    dueDate: z.string().datetime().optional(),
  }),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>["body"];

export const updateTodoSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid Todo ID format",
    }),
  }),
  body: z
    .object({
      task: z.string().min(1, "Todo task cannot be empty").optional(),
      completed: z.boolean().optional(),
      dueDate: z.string().datetime().optional(),
    })
    .refine((data) => data.task !== undefined || data.completed !== undefined || data.dueDate !== undefined, {
      message: "At least one field must be provided for update",
    }),
});

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>["body"];
export type UpdateTodoParams = z.infer<typeof updateTodoSchema>["params"];

export const todoIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid Todo ID format",
    }),
  }),
});
export type TodoIdParams = z.infer<typeof todoIdParamSchema>["params"];
