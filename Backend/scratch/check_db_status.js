const { sequelize, User, Store } = require('../models');

async function check() {
  try {
    console.log('Testing connection to Neon Cloud PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Success! Active connection established.');
    
    const users = await User.findAll({ 
      attributes: ['name', 'email', 'role'],
      raw: true 
    });
    console.log(`\n👥 Registered Users in Database (${users.length}):`);
    users.forEach(u => {
      console.log(`- Name: "${u.name}" | Email: ${u.email} | Role: ${u.role}`);
    });
    
    const stores = await Store.findAll({ 
      attributes: ['name', 'email', 'address'],
      raw: true 
    });
    console.log(`\n🏪 Stores in Database (${stores.length}):`);
    stores.forEach(s => {
      console.log(`- Store Name: "${s.name}" | Email: ${s.email}`);
    });

  } catch (err) {
    console.error('❌ Connection Failed:', err);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

check();
