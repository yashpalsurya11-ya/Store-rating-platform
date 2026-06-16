const sequelize = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Associations

// 1. User (StoreOwner) <-> Store (1-to-1)
User.hasOne(Store, {
  foreignKey: 'ownerId',
  as: 'ownedStore',
  onDelete: 'CASCADE'
});
Store.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

// 2. User (Normal User) <-> Rating (1-to-Many)
User.hasMany(Rating, {
  foreignKey: 'userId',
  as: 'submittedRatings',
  onDelete: 'CASCADE'
});
Rating.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 3. Store <-> Rating (1-to-Many)
Store.hasMany(Rating, {
  foreignKey: 'storeId',
  as: 'ratings',
  onDelete: 'CASCADE'
});
Rating.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store'
});

module.exports = {
  sequelize,
  User,
  Store,
  Rating
};
