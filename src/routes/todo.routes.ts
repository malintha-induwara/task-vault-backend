import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import { validateRequest } from '../middleware/validateRequest';
import { createTodoSchema, todoIdParamSchema, updateTodoSchema } from '../validators/todo.validator';
import { createNewTodo, deleteExistingTodo, getAllTodos, updateExistingTodo } from '../controllers/todo.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createTodoSchema), createNewTodo);
router.get('/', getAllTodos);
router.put('/:id', validateRequest(updateTodoSchema),updateExistingTodo);
router.delete('/:id', validateRequest(todoIdParamSchema), deleteExistingTodo);

export default router;