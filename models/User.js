const bcrypt = require("bcryptjs");
const Messages = require("../constants/Message");
const TryCatch = require("../helper/TryCatch");
const { ObjectId } = require('mongodb');
const usersCollection = require("../db").db().collection("user");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUp = function () {
  // get rid of any bogus properties
  this.data = {
    //predfined start
    name: this.data.name,
    lName: this.data.lName,
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
    contactNumber: this.data.contactNumber,
    address: this.data.address,
    city: this.data.city,
    role: "user",
    createdAt: new Date(),
//predefined end

  };
};

User.prototype.login = async function () {
  let attemptedUser = await usersCollection.findOne({ email: this.data.email });
  this.cleanUp();
  if (
    attemptedUser &&
    bcrypt.compareSync(this.data.password, attemptedUser.password)
  ) {
    this.data = attemptedUser;
    return true;
  } else {
    return false;
  }
};

User.prototype.register =async function  () {
    this.cleanUp();
 
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      return true
    
};

User.prototype.findByEmail = async function (email) {
  let userDoc = await usersCollection.findOne({ email: email })
  return userDoc
     
};

User.prototype.doesEmailExist = async function (email) {
 
    let user = await usersCollection.findOne({ email: email });
    if (user) {
      return true;
    } else {
      return false;
    }
  }

User.prototype.getById = async function (id){
  let userDoc = await usersCollection.findOne({_id: new ObjectId(id)})
  return userDoc
}

User.prototype.updateById = async function (id, data) {
  let userDoc = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        name: data.name,
        lName: data.lName,
        email: data.email,
        contactNumber: data.contactNumber,
        address: data.address,
        city: data.city,
        role: "user",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return userDoc;
};

User.prototype.updateByEmail = async function (email, data) {
  let userDoc = await usersCollection.findOneAndUpdate(
    { email: email },
    {
      $set: {
        name: data.name,
        lName: data.lName,
        email: data.email,
        contactNumber: data.contactNumber,
        address: data.address,
        city: data.city,
        role: "user",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return userDoc;
};


User.prototype.getAllUsers = async function (){
  let userDoc = await usersCollection.find({}).toArray()
  return userDoc
}

User.prototype.deleteById = async function (id){
 await usersCollection.deleteOne({_id: new ObjectId(id)})
  return 
}

module.exports = User;