import mongoose from "mongoose";
import petService from "../services/pet.service.js";

const handlePetError = (error, res) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal Server Error" : error.message;

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

const isValidPetId = (pid) => mongoose.isValidObjectId(pid);

const isValidDate = (date) => !Number.isNaN(new Date(date).getTime());

const hasInvalidOwner = (owner) => (
  owner !== undefined
  && owner !== null
  && !mongoose.isValidObjectId(owner)
);

// Get all pets - obtiene todos los mascotas

export const getAllPets = async (req, res) => {
  try {
    const pets = await petService.getPets();
    res.status(200).json({
      status: "success",
      payload: pets,
    });
  } catch (error) {
    handlePetError(error, res);
  }
};
// Get a pet by ID - obtiene una mascota por ID

export const getPet = async (req, res) => {
  try {
    const { pid } = req.params;

    if (!isValidPetId(pid)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pet id",
      });
    }

    const pet = await petService.getPetById(pid);

    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    res.status(200).json({
      status: "success",
      payload: pet,
    });
  } catch (error) {
    handlePetError(error, res);
  }
};

// create a pet - crea una mascota
export const createPet = async (req, res) => {
  try {
    const { name, specie, birthDate } = req.body;

    if (!name || !specie || !birthDate) {
      return res.status(400).json({
        status: "error",
        message: "Incomplete values",
      });
    }

    if (!isValidDate(birthDate)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid birthDate",
      });
    }

    if (hasInvalidOwner(req.body.owner)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid owner id",
      });
    }

    const pet = await petService.createPet(req.body);

    res.status(201).json({
      status: "success",
      payload: pet,
    });
  } catch (error) {
    handlePetError(error, res);
  }
};

//update pet - actualiza una mascota
export const updatePet = async (req, res) => {
  try {
    const { pid } = req.params;

    if (!isValidPetId(pid)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pet id",
      });
    }

    if (req.body.birthDate && !isValidDate(req.body.birthDate)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid birthDate",
      });
    }

    if (hasInvalidOwner(req.body.owner)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid owner id",
      });
    }

    const pet = await petService.updatePet(pid, req.body);

    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }
    res.status(200).json({
      status: "success",
      payload: pet,
    });
  } catch (error) {
    handlePetError(error, res);
  }
};

//delete pet - elimina una mascota
export const deletePet = async (req, res) => {
  try {
    const { pid } = req.params;

    if (!isValidPetId(pid)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pet id",
      });
    }

    const pet = await petService.deletePet(pid);

    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: `Pet ${pet.name} deleted successfully`,
      payload: pet,
    });
  } catch (error) {
    handlePetError(error, res);
  }
};
