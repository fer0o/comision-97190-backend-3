import { petRepository } from '../repositories/index.js';

class PetService {
    //create pet - crea un registro de mascota
    createPet(petData, options = {}){
        return petRepository.create(petData, options);   
    }

    //get pets - obtiene una lista de mascotas
    getPets(filter = {}, options = {}){
        return petRepository.getAll(filter, options);
    }
    //get pets by ID - obtiene las mascotas por ID

    getPetById(id, options = {}){
        return petRepository.findById(id, options);
    }

    //update pet - actualiza una mascota por id

    updatePet(id, updateFields, options = {}){
        return petRepository.update(id, updateFields, options);
    }

    //delete pet - elimina una mascota por id

    deletePet(id, options = {}){
        return petRepository.delete(id, options);
    }

}

export default new PetService();
