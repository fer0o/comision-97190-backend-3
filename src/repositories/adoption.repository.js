import adoptionMongoDAO from '../dao/mongo/adoption.mongo.dao.js';

class AdoptionRepository {
    constructor(dao) {
        this.dao = dao;
    }

    create(adoptionData, options = {}) {
        return this.dao.create(adoptionData, options);
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

export default new AdoptionRepository(adoptionMongoDAO);
