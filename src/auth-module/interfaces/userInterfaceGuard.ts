import { User } from './userInterface';

export interface AuthenticatedRequest extends Request {
  user: User;
}
