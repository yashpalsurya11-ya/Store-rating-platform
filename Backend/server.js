const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { sequelize, User } = require('./models');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/store', storeRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Store Management Coding Challenge API is running.');
});

// Seed default Administrator account if database is empty
async function seedDefaultAdmin() {
  try {
    const adminCount = await User.count({ where: { role: 'Admin' } });
    if (adminCount === 0) {
      console.log('No Administrator found. Seeding default Admin user...');
      
      const defaultPassword = 'Admin@12345';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await User.create({
        name: 'System Administrator Account', // 28 chars (fits min 20, max 60 constraint)
        email: 'admin@storemanager.com',
        password: hashedPassword,
        address: 'Default Admin Main Office Address',
        role: 'Admin'
      });
      
      console.log('Default Admin seeded successfully!');
      console.log('Email: admin@storemanager.com');
      console.log('Password: ' + defaultPassword);
    }
  } catch (err) {
    console.error('Failed to seed default admin:', err);
  }
}

// Database Connection & Server Startup
async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('PostgreSQL connection established successfully.');

    // Sync models (force: false means it won't drop tables, only create them if they do not exist)
    // To reset database, set to { force: true } (careful in production!)
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    // Seed data
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
}

startServer();
