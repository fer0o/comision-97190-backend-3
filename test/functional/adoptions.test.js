import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../src/app.js";
import { connectDB } from "../../src/config/db.js";
import userModel from "../../src/models/user.model.js";
import petModel from "../../src/models/pet.model.js";
import adoptionModel from "../../src/models/adoption.model.js";

const requester = supertest(app);
let testUser;
let testPet;
let testAdoption;
// Constants for test data
const testUserEmail = "adoptions.test@example.com";
const testPetName = "Adoption Test Pet";

const cleanTestData = async () => {
  const existingTestUser = await userModel.findOne({ email: testUserEmail });
  const existingTestPet = await petModel.findOne({ name: testPetName });

  await adoptionModel.deleteMany({
    $or: [
      ...(existingTestUser ? [{ owner: existingTestUser._id }] : []),
      ...(existingTestPet ? [{ pet: existingTestPet._id }] : []),
    ],
  });

  await userModel.deleteOne({ email: testUserEmail });
  await petModel.deleteOne({ name: testPetName });
};

describe("Adoptions router", () => {
  before(async () => {
    await connectDB();

    await cleanTestData();

    testUser = await userModel.create({
      first_name: "Adoption",
      last_name: "Test",
      email: testUserEmail,
      password: "123456",
    });

    testPet = await petModel.create({
      name: testPetName,
      specie: "dog",
      birthDate: new Date("2023-01-01"),
    });
  });

  after(async () => {
    await cleanTestData();
    await mongoose.connection.close();
  });

  // Get all adoptions
  it("GET /api/adoptions returns an array", async () => {
    const { status, body } = await requester.get("/api/adoptions");

    expect(status).to.equal(200);
    expect(body).to.have.property("status", "success");
    expect(body.payload).to.be.an("array");
  });

  // Create an adoption
  it("POST /api/adoptions/:uid/:pid creates an adoption", async () => {
    const { status, body } = await requester.post(
      `/api/adoptions/${testUser._id}/${testPet._id}`,
    );

    expect(status).to.equal(201);
    expect(body).to.have.property("status", "success");
    expect(body.payload).to.have.property("owner", testUser._id.toString());
    expect(body.payload).to.have.property("pet", testPet._id.toString());
    expect(body.payload).to.have.property("status", "active");

    testAdoption = body.payload;

    const updatedPet = await petModel.findById(testPet._id).lean();
    expect(updatedPet.adopted).to.equal(true);
    expect(updatedPet.owner.toString()).to.equal(testUser._id.toString());
  });

  //get adoption by id
  it("GET /api/adoptions/:aid returns an adoption by id", async () => {
    const { status, body } = await requester.get(
      `/api/adoptions/${testAdoption._id}`,
    );

    expect(status).to.equal(200);
    expect(body).to.have.property("status", "success");
    expect(body.payload).to.have.property("_id", testAdoption._id.toString());
    expect(body.payload).to.have.property("owner", testUser._id.toString());
    expect(body.payload).to.have.property("pet", testPet._id.toString());
    expect(body.payload).to.have.property("status", "active");
  });

  //first negative test pet is already adopted
  it("POST /api/adoptions/:uid/:pid returns 400 if pet is already adopted", async () => {
    const { status, body } = await requester.post(
      `/api/adoptions/${testUser._id}/${testPet._id}`,
    );

    expect(status).to.equal(400);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "Pet is already adopted");
  });

  //second negative test invalid aid
  it("GET /api/adoptions/:aid returns 400 if adoption id is invalid", async () => {
    const { status, body } = await requester.get("/api/adoptions/not-an-id");

    expect(status).to.equal(400);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "Invalid adoption id");
  });

  //third negative test invalid uid
  it("POST /api/adoptions/:uid/:pid returns 400 if user id is invalid", async () => {
    const { status, body } = await requester.post(
      `/api/adoptions/not-an-id/${testPet._id}`,
    );

    expect(status).to.equal(400);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "Invalid user id");
  });

  //fourth negative test invalid pid
  it("POST /api/adoptions/:uid/:pid returns 400 if pet id is invalid", async () => {
    const { status, body } = await requester.post(
      `/api/adoptions/${testUser._id}/not-an-id`,
    );

    expect(status).to.equal(400);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "Invalid pet id");
  });

  //fifth negative test non-existing aid
  it("GET /api/adoptions/:aid returns 404 if adoption does not exist", async () => {
    const nonExistingAdoptionId = new mongoose.Types.ObjectId();

    const { status, body } = await requester.get(
      `/api/adoptions/${nonExistingAdoptionId}`,
    );

    expect(status).to.equal(404);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "Adoption not found");
  });

  //sixth negative test non-existing uid
  it("POST /api/adoptions/:uid/:pid returns 404 if user does not exist", async () => {
    const nonExistingUserId = new mongoose.Types.ObjectId();

    const { status, body } = await requester.post(
      `/api/adoptions/${nonExistingUserId}/${testPet._id}`,
    );

    expect(status).to.equal(404);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "User not found");
  });

  //seventh negative test non-existing pid
  it("POST /api/adoptions/:uid/:pid returns 404 if pet does not exist", async () => {
    const nonExistingPetId = new mongoose.Types.ObjectId();

    const { status, body } = await requester.post(
      `/api/adoptions/${testUser._id}/${nonExistingPetId}`,
    );

    expect(status).to.equal(404);
    expect(body).to.have.property("status", "error");
    expect(body).to.have.property("message", "Pet not found");
  });

  //eighth negative test concurrent adoption
  it("POST /api/adoptions/:uid/:pid allows only one adoption under concurrency", async () => {
    const concurrentPet = await petModel.create({
      name: "Concurrent Adoption Test Pet",
      specie: "dog",
      birthDate: new Date("2023-01-01"),
    });

    try {
      const responses = await Promise.all([
        requester.post(`/api/adoptions/${testUser._id}/${concurrentPet._id}`),
        requester.post(`/api/adoptions/${testUser._id}/${concurrentPet._id}`),
      ]);

      const statuses = responses.map((response) => response.status).sort();

      expect(statuses).to.deep.equal([201, 400]);

      const successfulResponse = responses.find(
        (response) => response.status === 201,
      );
      const failedResponse = responses.find(
        (response) => response.status === 400,
      );

      expect(successfulResponse.body).to.have.property("status", "success");
      expect(failedResponse.body).to.have.property("status", "error");
      expect(failedResponse.body).to.have.property(
        "message",
        "Pet is already adopted",
      );

      const adoptions = await adoptionModel
        .find({ pet: concurrentPet._id })
        .lean();

      expect(adoptions).to.have.lengthOf(1);
    } finally {
      await adoptionModel.deleteMany({ pet: concurrentPet._id });
      await petModel.deleteOne({ _id: concurrentPet._id });
    }
  });
});
