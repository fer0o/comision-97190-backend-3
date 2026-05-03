//logica de negocio de las adopciones
import { adoptionRepository } from "../repositories/index.js";

import petService from "./pet.service.js";
import userService from "./user.service.js";

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
        const user = await userService.getUserById(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const pet = await petService.getPetById(petId);

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
        const adoption = await adoptionRepository.create({
            owner: user._id,
            pet: pet._id,
        });

        //update pet as adopted
        await petService.updatePet(pet._id, {
            adopted: true,
            owner: user._id,
        });

        return adoption;
    }
}




export default new AdoptionService();
