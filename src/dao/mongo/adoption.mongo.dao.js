import mongoose from "mongoose";
import adoptionModel from "../../models/adoption.model.js";

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

}

class AdoptionMongoDao {

    //create an adoption in the database
    async create(adoptionData, options = {}) {
        const { session } = options;

        if (session) {
            const [adoption] = await adoptionModel.create([adoptionData], { session });
            return adoption.toObject();
        }

        const adoption = await adoptionModel.create(adoptionData);
        return adoption.toObject();
    }

    //getAll - get all adoptions from the database
    async getAll(filter = {}, options = {}) {
        const { skip, limit, sort, select, session } = options;

        let query = adoptionModel.find(filter);

        if (select) query = query.select(select);
        if (sort) query = query.sort(sort);
        if (Number.isInteger(skip) && skip >= 0) query = query.skip(skip);
        if (Number.isInteger(limit) && limit > 0) query = query.limit(limit);

        if (session) query = query.session(session);

        return query.lean();
    }

    //getOne - get one adoption from the database
    async getOne(filterOrId, options = {}) {
        const filter = resolveFilter(filterOrId);
        if (!filter) return null;

        const { select, session } = options;
        let query = adoptionModel.findOne(filter);

        if (select) query = query.select(select);
        if (session) query = query.session(session);

        return query.lean();
    }

    //update - update an adoption in the database
    async update(filterOrId, updateFields, options = {}) {
        const filter = resolveFilter(filterOrId);
        if (!filter) return null;

        const { session, runValidators = true, select } = options;

        let query = adoptionModel.findOneAndUpdate(filter, updateFields, {
            new: true,
            runValidators,
        });

        if (select) query = query.select(select);
        if (session) query = query.session(session);

        return query.lean();
    }

    //delete - delete an adoption from the database
    async delete(filterOrId, options = {}) {
        const filter = resolveFilter(filterOrId);
        if (!filter) return null;

        const { session } = options;
        let query = adoptionModel.findOneAndDelete(filter);


        if (session) query = query.session(session);

        return query.lean();
    }

}

export default new AdoptionMongoDao();
