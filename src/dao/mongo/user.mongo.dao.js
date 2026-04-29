import mongoose from 'mongoose';
import userModel from '../../models/user.model.js';

const resolveFilter = (filterOrId) => {
  if (!filterOrId) return null;

  if (typeof filterOrId === 'string') {
    if (!mongoose.isValidObjectId(filterOrId)) return null;
    return { _id: filterOrId };
  }

  if (filterOrId instanceof mongoose.Types.ObjectId) {
    return { _id: filterOrId };
  }

  if (typeof filterOrId === 'object') {
    return filterOrId;
  }

  return null;
};

class UserMongoDAO {
  // Crea un usuario en MongoDB.
  async create(userData, options = {}) {
    const { session } = options;

    if (session) {
      const [user] = await userModel.create([userData], { session });
      return user.toObject();
    }

    const user = await userModel.create(userData);
    return user.toObject();
  }

  // Retorna usuarios segun el filtro recibido.
  async getAll(filter = {}, options = {}) {
    const { skip, limit, sort, select, session } = options;

    let query = userModel.find(filter);

    if (select) query = query.select(select);
    if (sort) query = query.sort(sort);
    if (Number.isInteger(skip) && skip >= 0) query = query.skip(skip);
    if (Number.isInteger(limit) && limit > 0) query = query.limit(limit);
    if (session) query = query.session(session);

    return query.lean();
  }

  // Retorna un usuario por id o filtro.
  async getOne(filterOrId, options = {}) {
    const filter = resolveFilter(filterOrId);
    if (!filter) return null;

    const { select, session } = options;

    let query = userModel.findOne(filter);

    if (select) query = query.select(select);
    if (session) query = query.session(session);

    return query.lean();
  }

  // Actualiza un usuario por id o filtro.
  async update(filterOrId, updateFields, options = {}) {
    const filter = resolveFilter(filterOrId);
    if (!filter) return null;

    const { session, runValidators = true, select } = options;

    let query = userModel.findOneAndUpdate(filter, updateFields, {
      new: true,
      runValidators,
    });

    if (select) query = query.select(select);
    if (session) query = query.session(session);

    return query.lean();
  }

  // Elimina un usuario por id o filtro.
  async delete(filterOrId, options = {}) {
    const filter = resolveFilter(filterOrId);
    if (!filter) return null;

    const { session } = options;
    let query = userModel.findOneAndDelete(filter);

    if (session) query = query.session(session);

    return query.lean();
  }
}

export default new UserMongoDAO();
