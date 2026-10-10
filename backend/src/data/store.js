const { buildSeed } = require("./seed");

function createStore() {
  const seed = buildSeed();
  return {
    student: seed.student,
    courses: seed.courses,
    tasks: seed.tasks,
    availability: seed.availability,
  };
}

module.exports = { createStore };
