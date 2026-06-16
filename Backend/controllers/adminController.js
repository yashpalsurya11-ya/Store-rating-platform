const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, User, Store, Rating } = require('../models');
const { validatePassword, validateEmail } = require('../utils/validation');

// 1. Get dashboard stats (total users, total stores, total ratings)
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, storeCount, ratingCount] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count()
    ]);

    return res.status(200).json({
      totalUsers: userCount,
      totalStores: storeCount,
      totalRatings: ratingCount
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 2. Create a new user (role: Admin or User)
exports.createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    if (!role || !['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'Admin' or 'User'." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters, and contain at least one uppercase letter and one special character."
      });
    }

    if (!name || name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 2 and 60 characters." });
    }

    if (!address || address.length > 400) {
      return res.status(400).json({ message: "Address must not exceed 400 characters." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      address,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      message: `${role} user created successfully.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 3. Create a new store (creates both StoreOwner User and Store record)
exports.createStore = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, address, password } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be 8-16 characters, and contain at least one uppercase letter and one special character."
      });
    }

    // Validate name (representing store name)
    if (!name || name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Store name must be between 2 and 60 characters." });
    }

    // Validate address
    if (!address || address.length > 400) {
      return res.status(400).json({ message: "Store address must not exceed 400 characters." });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({ message: "Email is already in use by another user or store." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create User with role 'StoreOwner'
    const owner = await User.create({
      name, // StoreOwner user holds the Store Name
      email,
      address,
      password: hashedPassword,
      role: 'StoreOwner'
    }, { transaction });

    // 2. Create the Store linked to the owner
    const store = await Store.create({
      name,
      email,
      address,
      ownerId: owner.id
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: "Store and Store Owner account created successfully.",
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating store:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 4. View list of normal and admin users (excl. store owners) with filter/sort
exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const whereClause = {
      role: {
        [Op.in]: ['Admin', 'User']
      }
    };

    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [Op.iLike]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [Op.iLike]: `%${address}%` };
    }
    if (role && ['Admin', 'User'].includes(role)) {
      whereClause.role = role;
    }

    // Validate sorting parameters
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      order: [[activeSortField, activeSortOrder]]
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 5. View list of stores with overall average rating and sorting/filtering
exports.getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const whereClause = {};
    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [Op.iLike]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [Op.iLike]: `%${address}%` };
    }

    const validSortFields = ['name', 'email', 'address', 'rating', 'createdAt'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // To allow ordering by rating, we aggregate ratings inside subqueries or direct groups.
    // Grouping by Store fields allows us to aggregate correctly.
    let orderOption = [];
    if (activeSortField === 'rating') {
      orderOption = [[sequelize.literal('"averageRating"'), activeSortOrder]];
    } else {
      orderOption = [[activeSortField, activeSortOrder]];
    }

    const stores = await Store.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'createdAt',
        [
          sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('ratings.rating')), 0),
          'averageRating'
        ]
      ],
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: []
        }
      ],
      group: ['Store.id'],
      order: orderOption,
      subQuery: false // Necessary when joining and using LIMIT or GROUP BY in Sequelize
    });

    // Parse the decimal average rating back to a float number
    const formattedStores = stores.map(store => {
      const data = store.get({ plain: true });
      data.averageRating = parseFloat(parseFloat(data.averageRating).toFixed(2));
      return data;
    });

    return res.status(200).json(formattedStores);

  } catch (error) {
    console.error("Error retrieving stores:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 6. View details of all users (including rating if user is Store Owner)
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = user.get({ plain: true });

    if (userData.role === 'StoreOwner') {
      // Find the store linked to this owner
      const store = await Store.findOne({
        where: { ownerId: userData.id },
        include: [{
          model: Rating,
          as: 'ratings',
          attributes: ['rating']
        }]
      });

      if (store) {
        const ratingCount = store.ratings.length;
        const totalRating = store.ratings.reduce((sum, r) => sum + r.rating, 0);
        userData.averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(2)) : 0;
        userData.storeName = store.name;
        userData.storeId = store.id;
      } else {
        userData.averageRating = 0;
        userData.storeName = "No store linked";
      }
    }

    return res.status(200).json(userData);

  } catch (error) {
    console.error("Error retrieving user details:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
