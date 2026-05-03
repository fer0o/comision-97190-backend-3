import petMongoDAO from '../dao/mongo/pet.mongo.dao.js';

class PetRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(petData, options = {}) {
    return this.dao.create(petData, options);
  }

  getAll(filter = {}, options = {}) {
    return this.dao.getAll(filter, options);
  }

  getOne(filterOrId, options = {}) {
    return this.dao.getOne(filterOrId, options);
  }

  update(filterOrId, updateFields, options = {}) {
    return this.dao.update(filterOrId, updateFields, options);
  }

  delete(filterOrId, options = {}) {
    return this.dao.delete(filterOrId, options);
  }

  findById(id, options = {}) {
    return this.dao.getOne(id, options);
  }
}

export default new PetRepository(petMongoDAO);
