const { ObjectId } = require("mongodb");
const problemsCollection = require("../db").db().collection("problems");

let Problem = function (data) {
  this.data = data;
  this.errors = [];
};

// Insert multiple problems for a user
Problem.prototype.insertMany = async function (problems, userId) {
  const problemsWithUserId = problems.map((problem) => ({
    title: problem.title,
    link: problem.link,
    done: false,
    userId: new ObjectId(userId),
    cycleNumber: 1,
    createdAt: new Date(),
  }));

  const result = await problemsCollection.insertMany(problemsWithUserId);
  return result;
};

// Get all problems for a user
Problem.prototype.getByUserId = async function (userId) {
  const problems = await problemsCollection
    .find({ userId: new ObjectId(userId) })
    .toArray();
  return problems;
};

// Get unsolved problems for a user
Problem.prototype.getUnsolvedByUserId = async function (userId) {
  const problems = await problemsCollection
    .find({
      userId: new ObjectId(userId),
      done: false,
    })
    .toArray();
  return problems;
};

// Get random unsolved problems
Problem.prototype.getRandomUnsolved = async function (userId, count = 5) {
  const problems = await problemsCollection
    .aggregate([
      { $match: { userId: new ObjectId(userId), done: false } },
      { $sample: { size: count } },
    ])
    .toArray();
  return problems;
};

// Toggle problem done status
Problem.prototype.markAsDone = async function (problemId) {
  // First get the current status
  const problem = await problemsCollection.findOne({
    _id: new ObjectId(problemId),
  });

  if (!problem) {
    throw new Error("Problem not found");
  }

  // Toggle the done status
  const newDoneStatus = !problem.done;
  const updateData = { done: newDoneStatus };

  // If marking as done, set completedAt. If marking as undone, remove completedAt
  if (newDoneStatus) {
    updateData.completedAt = new Date();
  } else {
    updateData.completedAt = null;
  }

  const result = await problemsCollection.updateOne(
    { _id: new ObjectId(problemId) },
    { $set: updateData }
  );

  return { ...result, newStatus: newDoneStatus };
};

// Get statistics for a user
Problem.prototype.getStats = async function (userId) {
  const total = await problemsCollection.countDocuments({
    userId: new ObjectId(userId),
  });
  const completed = await problemsCollection.countDocuments({
    userId: new ObjectId(userId),
    done: true,
  });

  return {
    total,
    completed,
    remaining: total - completed,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

// Reset all problems for a user (for repeat cycle)
Problem.prototype.resetCycle = async function (userId) {
  const result = await problemsCollection.updateMany(
    { userId: new ObjectId(userId) },
    {
      $set: { done: false },
      $unset: { completedAt: "" },
      $inc: { cycleNumber: 1 },
    }
  );
  return result;
};

// Delete all problems for a user
Problem.prototype.deleteAllByUserId = async function (userId) {
  const result = await problemsCollection.deleteMany({
    userId: new ObjectId(userId),
  });
  return result;
};

// Check if user has any problems
Problem.prototype.userHasProblems = async function (userId) {
  const count = await problemsCollection.countDocuments({
    userId: new ObjectId(userId),
  });
  return count > 0;
};

module.exports = Problem;
