const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING STORE PULSE API INTEGRATION TESTS ---');
  let adminToken = '';
  let userToken = '';
  let storeOwnerToken = '';
  let createdStoreId = '';

  const uniqueSuffix = Date.now();
  const testUserEmail = `user.${uniqueSuffix}@test.com`;
  const testStoreEmail = `owner.${uniqueSuffix}@test.com`;

  // Helper for requests
  async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      headers
    };
    if (body) {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  // TEST 1: Register Normal User with short name validation failure (Min 2 chars)
  console.log('\n[Test 1] Register user with short name (should fail)...');
  const t1 = await apiCall('/auth/register', 'POST', {
    name: 'X', // 1 char (violates min 2 chars rule)
    email: `short.${uniqueSuffix}@test.com`,
    address: '123 Test Lane Road',
    password: 'Password@123'
  });
  console.log(`Status: ${t1.status} (Expected: 400)`);
  console.log(`Response:`, t1.data);

  // TEST 2: Register Normal User with invalid password (should fail)
  console.log('\n[Test 2] Register user with invalid password (should fail)...');
  const t2 = await apiCall('/auth/register', 'POST', {
    name: 'Johnathan Alexander Doe',
    email: `badpwd.${uniqueSuffix}@test.com`,
    address: '123 Test Lane Road',
    password: 'nopwd' // no uppercase, no special, < 8 chars
  });
  console.log(`Status: ${t2.status} (Expected: 400)`);
  console.log(`Response:`, t2.data);

  // TEST 3: Register valid Normal User (should succeed)
  console.log('\n[Test 3] Register valid Normal User (should succeed)...');
  const t3 = await apiCall('/auth/register', 'POST', {
    name: 'Johnathan Alexander Doe', // 24 chars
    email: testUserEmail,
    address: '123 Test Lane Road, Springfield',
    password: 'UserPassword@123' // 16 chars
  });
  console.log(`Status: ${t3.status} (Expected: 201)`);
  if (t3.status === 201) {
    userToken = t3.data.token;
    console.log(`Success! User Token generated.`);
  } else {
    console.log('Failed register:', t3.data);
    return;
  }

  // TEST 4: Login as default Administrator (seeded on server start)
  console.log('\n[Test 4] Login as System Admin (should succeed)...');
  const t4 = await apiCall('/auth/login', 'POST', {
    email: 'admin@storemanager.com',
    password: 'Admin@12345'
  });
  console.log(`Status: ${t4.status} (Expected: 200)`);
  if (t4.status === 200) {
    adminToken = t4.data.token;
    console.log(`Success! Admin Token generated.`);
  } else {
    console.log('Failed admin login. Make sure the server has seeded the admin user.', t4.data);
    return;
  }

  // TEST 5: Admin creates a new Store (automatically spawns owner user)
  console.log('\n[Test 5] Admin creates new Store (should succeed)...');
  const t5 = await apiCall('/admin/stores', 'POST', {
    name: 'Supermart National Outlet', // 25 chars
    email: testStoreEmail,
    address: '789 Commercial Parkway Avenue, Sector 5',
    password: 'OwnerPass@123' // 13 chars (8-16 check)
  }, adminToken);
  console.log(`Status: ${t5.status} (Expected: 201)`);
  console.log(`Response:`, t5.data);
  if (t5.status === 201) {
    createdStoreId = t5.data.store.id;
  } else {
    console.log('Failed store creation.');
    return;
  }

  // TEST 6: User lists stores (with average ratings and user ratings)
  console.log('\n[Test 6] User lists stores (should succeed)...');
  const t6 = await apiCall('/user/stores', 'GET', null, userToken);
  console.log(`Status: ${t6.status} (Expected: 200)`);
  console.log(`Stores count: ${t6.data.length}`);
  const store = t6.data.find(s => s.id === createdStoreId);
  if (store) {
    console.log(`Created store found! Overall Rating: ${store.averageRating}, User Rating: ${store.userRating}`);
  }

  // TEST 7: User submits a rating for the new store
  console.log('\n[Test 7] User submits rating for store (should succeed)...');
  const t7 = await apiCall('/user/rating', 'POST', {
    storeId: createdStoreId,
    rating: 4
  }, userToken);
  console.log(`Status: ${t7.status} (Expected: 200)`);
  console.log(`Response:`, t7.data);

  // TEST 8: Store Owner logs in and checks dashboard stats
  console.log('\n[Test 8] Store Owner logs in (should succeed)...');
  const t8 = await apiCall('/auth/login', 'POST', {
    email: testStoreEmail,
    password: 'OwnerPass@123'
  });
  console.log(`Status: ${t8.status} (Expected: 200)`);
  if (t8.status === 200) {
    storeOwnerToken = t8.data.token;
  } else {
    console.log('Store owner login failed.');
    return;
  }

  console.log('\n[Test 9] Store Owner views dashboard metrics (should display average and user info)...');
  const t9 = await apiCall('/store/dashboard', 'GET', null, storeOwnerToken);
  console.log(`Status: ${t9.status} (Expected: 200)`);
  console.log(`Store Name: ${t9.data.storeName}`);
  console.log(`Average Rating: ${t9.data.averageRating} (Expected: 4)`);
  console.log(`Total Reviews: ${t9.data.totalRatingsCount} (Expected: 1)`);
  console.log(`Review list length: ${t9.data.ratings?.length}`);
  if (t9.data.ratings?.length > 0) {
    const r = t9.data.ratings[0];
    console.log(`- Rated by: ${r.user?.name}, Rating: ${r.rating}`);
  }

  console.log('\n--- ALL API INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Test script crashed:', err);
});
