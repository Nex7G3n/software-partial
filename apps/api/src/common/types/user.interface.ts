import { Role } from 'src/auth/domain/enums/role.enum';

export class User {
	id: string;
	email: string;
	name: string;
	roles: Role[];
	googleId?: string | null;
}
