const { Op } = require('sequelize');
const { sequelize, Store, Rating } = require('../models');

// 1. Get stores list with overall ratings and current user's submitted rating
exports.getStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const whereClause = {};
    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` };
    }
    if (address) {
      whereClause.address = { [Op.iLike]: `%${address}%` };
    }

    const validSortFields = ['name', 'address', 'rating'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let orderOption = [];
    if (activeSortField === 'rating') {
      orderOption = [[sequelize.literal('"averageRating"'), activeSortOrder]];
    } else {
      orderOption = [[activeSortField, activeSortOrder]];
    }

    // Fetch stores and their average ratings
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
      subQuery: false
    });

    // Fetch ratings submitted by this specific user
    const userRatings = await Rating.findAll({
      where: { userId }
    });

    // Create a key-value mapping of storeId -> rating
    const userRatingsMap = {};
    userRatings.forEach(r => {
      userRatingsMap[r.storeId] = r.rating;
    });

    // Format output
    const formattedStores = stores.map(store => {
      const data = store.get({ plain: true });
      data.averageRating = parseFloat(parseFloat(data.averageRating).toFixed(2));
      data.userRating = userRatingsMap[data.id] || null;
      return data;
    });

    return res.status(200).json(formattedStores);

  } catch (error) {
    console.error("Error retrieving stores for user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 2. Submit or modify a rating for a store
exports.submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ message: "Store ID and rating are required." });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
    }

    // Verify store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    // Upsert rating (Find existing or Create new)
    const [userRating, created] = await Rating.findOrCreate({
      where: { userId, storeId },
      defaults: { rating: numericRating }
    });

    if (!created) {
      // If it exists, update it (modify rating)
      userRating.rating = numericRating;
      await userRating.save();
    }

    return res.status(200).json({
      message: created ? "Rating submitted successfully." : "Rating updated successfully.",
      rating: userRating
    });

  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
