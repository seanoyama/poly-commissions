// i had to get jest to convert the tsx to js for unit testing - millie

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src/unit-tests"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.app.json"
      }
    ]
  }
};


