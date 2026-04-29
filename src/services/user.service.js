import { userRepository } from '../repositories/index.js';

class UserService {
  createUser(userData, options = {}) {
    return userRepository.create(userData, options);
  }

  getUsers(filter = {}, options = {}) {
    return userRepository.getAll(filter, { ...options, select: '-password' });
  }

  getUserById(id, options = {}) {
    return userRepository.findById(id, { ...options, select: '-password' });
  }

  getUserByEmail(email, options = {}) {
    return userRepository.findByEmail(email, options);
  }

  updateUser(id, updateFields, options = {}) {
    return userRepository.update(id, updateFields, {
      ...options,
      select: '-password',
    });
  }

  deleteUser(id, options = {}) {
    return userRepository.delete(id, options);
  }
}

export default new UserService();
