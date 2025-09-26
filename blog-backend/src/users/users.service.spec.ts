import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: '2', email: 'jane@example.com' },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('name', 'John Doe');
      expect(result[0]).toHaveProperty('email', 'john@example.com');
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user without password when user exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when email exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null when email does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create and return a user without password', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const createdUser = { ...mockUser };
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should create user with default role when not provided', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const createdUser = { ...mockUser, role: UserRole.USER };
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result.role).toBe(UserRole.USER);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update and return a user without password', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        email: 'john.updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(result).toHaveProperty('name', 'John Updated');
      expect(result).toHaveProperty('email', 'john.updated@example.com');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('999', updateUserDto)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user when user exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      await service.delete('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
      await expect(service.delete('999')).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });
});
