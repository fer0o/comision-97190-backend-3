import mongoose from "mongoose";
import adoptionService from "../services/adoption.service.js";

const handleAdoptionError = (error, res) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

const isValidId = (id) => mongoose.isValidObjectId(id);

// Get all adoptions
export const getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await adoptionService.getAdoptions();

    res.status(200).json({
      status: "success",
      payload: adoptions,
    });
  } catch (error) {
    handleAdoptionError(error, res);
  }
};

export const getAdoption = async (req, res) => {
  try {
    const { aid } = req.params;

    if (!isValidId(aid)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid adoption id",
      });
    }

    const adoption = await adoptionService.getAdoptionById(aid);

    if (!adoption) {
      return res.status(404).json({
        status: "error",
        message: "Adoption not found",
      });
    }

    res.status(200).json({
      status: "success",
      payload: adoption,
    });
  } catch (error) {
    handleAdoptionError(error, res);
  }
};

// Create a new adoption
export const createAdoption = async (req, res) => {
  try {
    const { uid, pid } = req.params;

    if (!isValidId(uid)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user id",
      });
    }

    if (!isValidId(pid)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pet id",
      });
    }

    const adoption = await adoptionService.createAdoption(uid, pid);

    res.status(201).json({
      status: "success",
      payload: adoption,
    });
  } catch (error) {
    handleAdoptionError(error, res);
  }
};
