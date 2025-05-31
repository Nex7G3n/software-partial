import { Role } from 'src/auth/domain/enums/role.enum';

export class UserUpdateDto {
	id?: string;
	email?: string;
	name?: string;
	roles?: Role[];
	googleId?: string;
}
