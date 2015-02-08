"use strict";

var bcrypt = require("bcrypt");

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: "Please enter a valid email"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5,20],
          msg: "Please enter a password over 5 characters long"
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.favorite);
      }
    },
    hooks: {
      beforeCreate: function(data, stuff, sendback){
        var pwdToEncrypt = data.password;
        var encryptedPwd = "placeholder";

        bcrypt.hash(pwdToEncrypt, 10, function(err, hash){
          encryptedPwd = hash;
          data.password = hash;
          sendback(null, data);
        });
      }
    }
  });

  return user;
};
