import { Role } from '../../auth/enums/role.enum';

export class User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  googleId?: string | null;
}
