const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a userID with valid email', function() {
    const users = testUsers;
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with unvalid email', function() {
    const users = testUsers;
    const user = getUserByEmail("hi@example.com", users)
    assert.notExists(user, 'baz is either null or undefined');

  });
});