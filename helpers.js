const getUserByEmail = function(email, database) {

  for (const userkeys in database) {
    if (database[userkeys].email === email) {
      return userkeys;
    }
  }
  //console.log(`this is test: ${user}`)

};

module.exports = { getUserByEmail };