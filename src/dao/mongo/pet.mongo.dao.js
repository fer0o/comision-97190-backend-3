import mongoose from 'mongoose';
import petModel from '../../models/pet.model.js';

const resolveFilter = (filterOrId) => {
    if (!filterOrId) return null;

    if(typeof filterOrId === 'string') {
        if(!mongoose.isValidObjectId(filterOrId)) return null;
        return { _id: filterOrId};
    }

    if(filterOrId instanceof mongoose.Types.ObjectId) {
        return { _id: filterOrId};
    }
    if(typeof filterOrId === 'object') {
        return filterOrId;
    }

    return null;

};

class PetMongoDAO {
    // create data for pets
    async create (petData, options = {}){
        const { session } = options;

        if(session) {
            const [pet] = await petModel.create([petData], {session});
            return pet.toObject();
        }

        const pet = await petModel.create(petData);
        return pet.toObject();
    }

    async getAll(filter = {}, options = {} ){
        const {skip, limit, sort, select, session} = options;

        let query = petModel.find(filter);

        if (select) query = query.select(select);
        if (sort) query = query.sort(sort);
        if (Number.isInteger(skip) && skip >= 0) query = query.skip(skip);
        if (Number.isInteger(limit) && limit > 0) query = query.limit(limit);
        if (session) query = query.session(session);

        return query.lean();
    };

    //getOne 
    async getOne(filterOrId, options = {}){
        const filter = resolveFilter(filterOrId);
        if(!filter) return null;

        const {select, session} = options;

        let query = petModel.findOne(filter);

        if(select) query = query.select(select);
        if(session) query = query.session(session);

        return query.lean();
    }

    //update
    async update (filterOrId, updateFields, options = {}){
        const filter = resolveFilter(filterOrId);
        if(!filter) return null;

        const {session, runValidators = true, select } = options;

        let query = petModel.findOneAndUpdate(filter, updateFields, {
            new: true,
            runValidators,
        });

        if(select) query = query.select(select);
        if(session) query = query.session(session);

        return query.lean();
    }
    //Delete
    async delete(filterOrId, options = {}){
        const filter = resolveFilter(filterOrId);
        if(!filter) return null;

        const {session} = options;

        let query = petModel.findOneAndDelete(filter);

        if(session) query = query.session(session);

        return query.lean();
    }
    

}
export default new PetMongoDAO();