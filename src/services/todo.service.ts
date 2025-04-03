import prisma from "../config/prisma";
import { Todo } from "@prisma/client";
import { CreateTodoInput, UpdateTodoInput, UpdateTodoParams, TodoIdParams } from "../validators/todo.validator";

export const createTodo = async (userId: string, input: CreateTodoInput): Promise<Todo> => {
  const { task, dueDate } = input;
  const todo = await prisma.todo.create({
    data: {
      task,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed: false,
      userId: userId,
    },
  });
  return todo;
};

interface GetTodosOptions {
  sortBy?: string;
}

export const getTodosByUser = async (userId: string, options: GetTodosOptions): Promise<Todo[]> => {
  const findOptions: { where: { userId: string }; orderBy?: any; take?: number; skip?: number } = {
    where: { userId: userId }, 
  };

  if (options.sortBy) {
    const [field, order] = options.sortBy.split(":");
    if (field === "createdAt" || field === "updatedAt" || field === "task" || field === "dueDate") {
      // Updated field list
      findOptions.orderBy = { [field]: order === "desc" ? "desc" : "asc" };
    }
  } else {
    findOptions.orderBy = { createdAt: "desc" }; // Default sort
  }

  const todos = await prisma.todo.findMany(findOptions);
  return todos;
};

export const updateTodoById = async (userId: string, params: UpdateTodoParams, input: UpdateTodoInput): Promise<Todo | null> => {
  const { id: todoId } = params;

  const result = await prisma.todo.updateMany({
    where: {
      id: todoId,
      userId: userId,
    },
    data: {
      task: input.task,
      completed: input.completed,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
  });

  if (result.count === 0) {
    // Todo not found OR it didn't belong to the user
    return null;
  }

  // Fetch the updated todo to return it
  const updatedTodo = await prisma.todo.findUnique({
    where: { id: todoId },
  });

  return updatedTodo;
};

export const deleteTodoById = async (userId: string, params: TodoIdParams): Promise<boolean> => {
  const { id: todoId } = params;

  const result = await prisma.todo.deleteMany({
    where: {
      id: todoId,
      userId: userId,
    },
  });
  return result.count > 0;
};
