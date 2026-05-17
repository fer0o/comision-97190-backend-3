import mongoose from "mongoose";
import { before, after } from "mocha";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongoReplSet;

before(async function () {
  this.timeout(60000);

  mongoReplSet = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: "wiredTiger",
    },
  });

  const mongoUri = mongoReplSet.getUri();

  await mongoose.connect(mongoUri, {
    dbName: "adoptme_test",
  });
});

after(async function () {
  this.timeout(60000);

  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoReplSet) {
    await mongoReplSet.stop();
  }
});
