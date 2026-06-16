const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define('Store', {
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
        msg: "Store name must be between 2 and 60 characters."
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: "Must follow standard email validation rules."
      }
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: {
        args: [0, 400],
        msg: "Store address must not exceed 400 characters."
      }
    }
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: {
      name: 'stores_ownerId_key',
      msg: "A store owner can only own one store."
    }
  }
}, {
  tableName: 'stores',
  timestamps: true
});

module.exports = Store;
