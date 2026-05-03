import mongoose from 'mongoose';

const collection = 'Pets';

const petSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },
        specie:{
            type: String,
            required: true,
            trim: true,
        },
        birthDate:{
            type: Date,
            required: true,
        },
        adopted:{
            type: Boolean,
            default:false
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Users',
            default: null,
        },
        image:{
            type:String,
            trim:true,
            default: '',
        },
    },
    {
        timestamps:true,
        versionKey:false,
    }
);

const petModel = mongoose.model(collection,petSchema);

export default petModel;
