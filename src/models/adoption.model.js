import mongoose from 'mongoose';

const collection = 'Adoptions';

const adoptionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        pet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pets',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'cancelled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

adoptionSchema.index(
    { pet: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'active' },
        name: 'unique_active_adoption_by_pet',
    },
);

const adoptionModel = mongoose.model(collection, adoptionSchema);

export default adoptionModel;
