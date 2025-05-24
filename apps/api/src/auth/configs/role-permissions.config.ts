import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';

export const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.ARTICLE_READ_ALL,
    Permission.ARTICLE_READ_ONE,
    Permission.ARTICLE_UPDATE_OWN,
    Permission.ARTICLE_DELETE_OWN,
    Permission.TASK_CREATE,
    Permission.TASK_READ_OWN_LIST,
    Permission.TASK_READ_OWN_DETAIL,
    Permission.TASK_UPDATE_OWN,
    Permission.TASK_DELETE_OWN,
  ],
  [Role.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ_ALL,
    Permission.USER_READ_ONE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_READ_ALL,
    Permission.ARTICLE_READ_ONE,
    Permission.ARTICLE_UPDATE_OWN,
    Permission.ARTICLE_UPDATE_ANY,
    Permission.ARTICLE_DELETE_OWN,
    Permission.ARTICLE_DELETE_ANY,

    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,

    Permission.TASK_CREATE,
    Permission.TASK_READ_OWN_LIST,
    Permission.TASK_READ_ANY_LIST,
    Permission.TASK_READ_OWN_DETAIL,
    Permission.TASK_READ_ANY_DETAIL,
    Permission.TASK_UPDATE_OWN,
    Permission.TASK_UPDATE_ANY,
    Permission.TASK_DELETE_OWN,
    Permission.TASK_DELETE_ANY,
  ],
  [Role.EDITOR]: [
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_READ_ALL,
    Permission.ARTICLE_READ_ONE,
    Permission.ARTICLE_UPDATE_OWN,
    Permission.ARTICLE_UPDATE_ANY,
    Permission.ARTICLE_DELETE_OWN,
  ],
  [Role.GUEST]: [Permission.ARTICLE_READ_ALL, Permission.ARTICLE_READ_ONE],
};
