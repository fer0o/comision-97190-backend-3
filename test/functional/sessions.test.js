import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import supertest from "supertest";
import app from "../../src/app.js";
import userModel from "../../src/models/user.model.js";

const requester = supertest(app);
const concurrentUserEmail = "sessions.concurrent.test@example.com";

const cleanTestData = async () => {
  await userModel.deleteMany({ email: concurrentUserEmail });
};

describe("Sessions router", () => {
  before(async () => {
    await cleanTestData();
  });

  after(async () => {
    await cleanTestData();
  });

  it("POST /api/sessions/register returns 400 for concurrent duplicated email", async () => {
    const userData = {
      first_name: "Concurrent",
      last_name: "Register",
      email: concurrentUserEmail,
      password: "123456",
    };

    const responses = await Promise.all([
      requester.post("/api/sessions/register").send(userData),
      requester.post("/api/sessions/register").send(userData),
    ]);

    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).to.deep.equal([201, 400]);

    const successfulResponse = responses.find(
      (response) => response.status === 201,
    );
    const failedResponse = responses.find((response) => response.status === 400);

    expect(successfulResponse.body).to.have.property("status", "success");
    expect(successfulResponse.body.payload).to.have.property(
      "email",
      concurrentUserEmail,
    );
    expect(successfulResponse.body.payload).to.not.have.property("password");

    expect(failedResponse.body).to.have.property("status", "error");
    expect(failedResponse.body).to.have.property(
      "message",
      "User already exists",
    );

    const users = await userModel.find({ email: concurrentUserEmail }).lean();

    expect(users).to.have.lengthOf(1);
  });
});
