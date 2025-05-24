// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Repository } from 'typeorm';

// Define the type for the mock repository
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type MockRepositoryType<T extends object> = {
  findOne: jest.Mock;
  find: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

export const mockRepository = <T extends object>(): MockRepositoryType<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});
