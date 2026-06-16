const { sequelize, Store, Rating, User } = require('../models');

// Get store dashboard details (average rating, count of ratings, list of rating users with details)
exports.getStoreDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // 1. Find the store owned by this user
    const store = await Store.findOne({ where: { ownerId } });
    if (!store) {
      return res.status(404).json({ message: "No store associated with this owner account." });
    }

    // 2. Compute aggregate ratings info
    const ratingsStats = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('rating')), 0), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'ratingCount']
      ],
      raw: true
    });

    const averageRating = parseFloat(parseFloat(ratingsStats.avgRating).toFixed(2));
    const totalRatingsCount = parseInt(ratingsStats.ratingCount, 10);

    // 3. Define sorting clause
    const validSortFields = ['name', 'email', 'rating', 'createdAt'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    let orderOption = [];
    if (activeSortField === 'name') {
      orderOption = [[{ model: User, as: 'user' }, 'name', activeSortOrder]];
    } else if (activeSortField === 'email') {
      orderOption = [[{ model: User, as: 'user' }, 'email', activeSortOrder]];
    } else if (activeSortField === 'rating') {
      orderOption = [['rating', activeSortOrder]];
    } else {
      orderOption = [['createdAt', activeSortOrder]];
    }

    // 4. Fetch list of users who submitted ratings for the store
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      attributes: ['id', 'rating', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'address']
        }
      ],
      order: orderOption
    });

    return res.status(200).json({
      storeName: store.name,
      storeAddress: store.address,
      averageRating,
      totalRatingsCount,
      ratings
    });

  } catch (error) {
    console.error("Error fetching store owner dashboard data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
