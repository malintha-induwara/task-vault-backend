import { NextFunction, Request, Response} from "express";
import * as todoService from "../services/todo.service";
import { CreateTodoInput, UpdateTodoInput, UpdateTodoParams, TodoIdParams } from "../validators/todo.validator";

export const createNewTodo = async (req: Request<{}, {}, CreateTodoInput>, res: Response, next:NextFunction) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const todo = await todoService.createTodo(req.user.id, req.body);
    res.status(201).json(todo);
  } catch (error) {
    next(error)
  }
};

export const getAllTodos = async (req: Request, res: Response, next:NextFunction) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    // Example: Get sort options from query params like /todos?sortBy=createdAt:desc
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const options = { sortBy };

    const todos = await todoService.getTodosByUser(req.user.id, options);
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

export const updateExistingTodo = async (req: Request<UpdateTodoParams, {}, UpdateTodoInput>, res: Response, next:NextFunction) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const updatedTodo = await todoService.updateTodoById(req.user.id, req.params, req.body);
    if (!updatedTodo) {
      res.status(404).json({ message: "Todo not found or access denied" });
      return;
    }
    res.status(200).json(updatedTodo);
  } catch (error) {
    next(error);
  }
};

export const deleteExistingTodo = async (req: Request<TodoIdParams>, res: Response, next:NextFunction) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const success = await todoService.deleteTodoById(req.user.id, req.params);
    if (!success) {
      res.status(404).json({ message: "Todo not found or access denied" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
