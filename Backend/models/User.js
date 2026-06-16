const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: {
        args: [2, 60],
        msg: "Name must be between 2 and 60 characters."
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'users_email_key',
      msg: "Email address already in use."
    },
    validate: {
      isEmail: {
        msg: "Must follow standard email validation rules."
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: {
        args: [0, 400],
        msg: "Address must not exceed 400 characters."
      }
    }
  },
  role: {
    type: DataTypes.ENUM('Admin', 'User', 'StoreOwner'),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
