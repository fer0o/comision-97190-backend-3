//logica de negocio de las adopciones
import mongoose from "mongoose";
import { adoptionRepository } from "../repositories/index.js";

import petService from "./pet.service.js";
import userService from "./user.service.js";

const isDuplicatedPetAdoption = (error) => {
    return error?.code === 11000 && (error?.keyPattern?.pet || error?.keyValue?.pet);
};

class AdoptionService {
    //getAdoptions
    getAdoptions(filter = {}, options = {}) {
        return adoptionRepository.getAll(filter, options);
    }
    //getAdoptionById
    getAdoptionById(id, options = {}) {
        return adoptionRepository.findById(id, options);
    }

    //create adoption
    async createAdoption(userId, petId) {
        const session = await mongoose.startSession();
        let adoption;

        try {
            await session.withTransaction(async () => {
                const user = await userService.getUserById(userId, { session });

                if (!user) {
                    const error = new Error("User not found");
                    error.statusCode = 404;
                    throw error;
                }

                const pet = await petService.getPetById(petId, { session });

                //check if pet exists
                if (!pet) {
                    const error = new Error("Pet not found");
                    error.statusCode = 404;
                    throw error;
                }

                //check if pet is adopted
                if (pet.adopted) {
                    const error = new Error("Pet is already adopted");
                    error.statusCode = 400;
                    throw error;
                }

                //create adoption
                adoption = await adoptionRepository.create({
                    owner: user._id,
                    pet: pet._id,
                }, { session });

                //update pet as adopted
                await petService.updatePet(pet._id, {
                    adopted: true,
                    owner: user._id,
                }, { session });
            });

            return adoption;
        } catch (error) {
            if (isDuplicatedPetAdoption(error)) {
                const duplicatedError = new Error("Pet is already adopted");
                duplicatedError.statusCode = 400;
                throw duplicatedError;
            }

            throw error;
        } finally {
            await session.endSession();
        }
    }
}




export default new AdoptionService();
