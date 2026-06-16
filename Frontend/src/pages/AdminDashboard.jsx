import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SortableTable from '../components/SortableTable';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import StarRating from '../components/StarRating';

const AdminDashboard = () => {
  const { authFetch } = useAuth();
  
  // Navigation Tabs: 'overview', 'users', 'stores'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats Metrics
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Users Listing & Sorting/Filtering
  const [users, setUsers] = useState([]);
  const [usersSortBy, setUsersSortBy] = useState('name');
  const [usersSortOrder, setUsersSortOrder] = useState('ASC');
  const [usersFilters, setUsersFilters] = useState({ name: '', email: '', address: '', role: '' });

  // Stores Listing & Sorting/Filtering
  const [stores, setStores] = useState([]);
  const [storesSortBy, setStoresSortBy] = useState('name');
  const [storesSortOrder, setStoresSortOrder] = useState('ASC');
  const [storesFilters, setStoresFilters] = useState({ name: '', email: '', address: '' });

  // Modals Visibility
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selected User Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Forms State & Errors
  const [userForm, setUserForm] = useState({ name: '', email: '', address: '', password: '', role: 'User' });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [userFormApiError, setUserFormApiError] = useState('');
  const [userFormLoading, setUserFormLoading] = useState(false);

  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', password: '' });
  const [storeFormErrors, setStoreFormErrors] = useState({});
  const [storeFormApiError, setStoreFormApiError] = useState('');
  const [storeFormLoading, setStoreFormLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [usersSortBy, usersSortOrder, usersFilters, activeTab]);

  useEffect(() => {
    if (activeTab === 'stores') fetchStores();
  }, [storesSortBy, storesSortOrder, storesFilters, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await authFetch('/admin/stats');
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        sortBy: usersSortBy,
        sortOrder: usersSortOrder,
        ...usersFilters
      }).toString();
      const res = await authFetch(`/admin/users?${queryParams}`);
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const queryParams = new URLSearchParams({
        sortBy: storesSortBy,
        sortOrder: storesSortOrder,
        ...storesFilters
      }).toString();
      const res = await authFetch(`/admin/stores?${queryParams}`);
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async (userId) => {
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);
    setSelectedUser(null);
    try {
      const res = await authFetch(`/admin/users/${userId}`);
      const data = await res.json();
      if (res.ok) setSelectedUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUsersFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreFilterChange = (e) => {
    const { name, value } = e.target;
    setStoresFilters((prev) => ({ ...prev, [name]: value }));
  };

  const validateUserForm = () => {
    const errs = {};
    if (!userForm.name) {
      errs.name = 'Name is required.';
    } else if (userForm.name.length < 2 || userForm.name.length > 60) {
      errs.name = `Name must be between 2 and 60 characters.`;
    }

    if (!userForm.email) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errs.email = 'Must follow standard email validation rules.';
    }

    if (!userForm.address) {
      errs.address = 'Address is required.';
    } else if (userForm.address.length > 400) {
      errs.address = `Address must be under 400 characters.`;
    }

    if (!userForm.password) {
      errs.password = 'Password is required.';
    } else {
      if (userForm.password.length < 8 || userForm.password.length > 16) {
        errs.password = 'Password must be 8-16 characters.';
      } else {
        const hasUpper = /[A-Z]/.test(userForm.password);
        const hasSpecial = /[!@#$%^&*()_+=\-[\]{};':",./<>?|\\`~]/.test(userForm.password);
        if (!hasUpper || !hasSpecial) {
          errs.password = 'Password needs at least one uppercase letter and one special character.';
        }
      }
    }

    setUserFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setUserFormLoading(true);
    setUserFormApiError('');
    try {
      const res = await authFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user.');

      setIsUserModalOpen(false);
      setUserForm({ name: '', email: '', address: '', password: '', role: 'User' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserFormApiError(err.message);
    } finally {
      setUserFormLoading(false);
    }
  };

  const validateStoreForm = () => {
    const errs = {};
    if (!storeForm.name) {
      errs.name = 'Store name is required.';
    } else if (storeForm.name.length < 2 || storeForm.name.length > 60) {
      errs.name = `Store name must be between 2 and 60 characters.`;
    }

    if (!storeForm.email) {
      errs.email = 'Owner email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeForm.email)) {
      errs.email = 'Must follow standard email validation rules.';
    }

    if (!storeForm.address) {
      errs.address = 'Store address is required.';
    } else if (storeForm.address.length > 400) {
      errs.address = `Address must be under 400 characters.`;
    }

    if (!storeForm.password) {
      errs.password = 'Owner password is required.';
    } else {
      if (storeForm.password.length < 8 || storeForm.password.length > 16) {
        errs.password = 'Password must be 8-16 characters.';
      } else {
        const hasUpper = /[A-Z]/.test(storeForm.password);
        const hasSpecial = /[!@#$%^&*()_+=\-[\]{};':",./<>?|\\`~]/.test(storeForm.password);
        if (!hasUpper || !hasSpecial) {
          errs.password = 'Password needs at least one uppercase letter and one special character.';
        }
      }
    }

    setStoreFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!validateStoreForm()) return;

    setStoreFormLoading(true);
    setStoreFormApiError('');
    try {
      const res = await authFetch('/admin/stores', {
        method: 'POST',
        body: JSON.stringify(storeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create store.');

      setIsStoreModalOpen(false);
      setStoreForm({ name: '', email: '', address: '', password: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      setStoreFormApiError(err.message);
    } finally {
      setStoreFormLoading(false);
    }
  };

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px' }
  ];

  const storeColumns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Store Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall Rating', sortable: true, width: '180px' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Tabs */}
        <aside style={{
          width: '260px',
          borderRight: '1px solid var(--border-card)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
            Console Navigation
          </span>
          <button
            onClick={() => setActiveTab('overview')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              backgroundColor: activeTab === 'overview' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--accent-primary)' : 'var(--text-main)',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '8px'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              backgroundColor: activeTab === 'users' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-main)',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '8px'
            }}
          >
            👥 Platform Users
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              backgroundColor: activeTab === 'stores' ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === 'stores' ? 'var(--accent-primary)' : 'var(--text-main)',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '8px'
            }}
          >
            🏪 Stores Directory
          </button>
        </aside>

        {/* Dashboard Content Panel */}
        <main style={{ flex: 1, padding: '2.5rem min(3rem, 5vw)' }}>
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem' }}>Welcome to StorePulse</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>System Administrator Overview & Management Dashboard</p>
              </div>

              {/* Stats Widgets */}
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{stats.totalUsers}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Platform registers</span>
                </div>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                  <span className="stat-label">Registered Stores</span>
                  <span className="stat-value">{stats.totalStores}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Active merchants</span>
                </div>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                  <span className="stat-label">Submitted Ratings</span>
                  <span className="stat-value">{stats.totalRatings}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Individual reviews</span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Management Shortcuts</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-inverse)' }}>Register Users</strong>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Create new platform members (Admins or Normal Users).</span>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setIsUserModalOpen(true)} style={{ width: 'fit-content' }}>
                      + Add New User
                    </button>
                  </div>
                  <div style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-inverse)' }}>Register Stores</strong>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Launch stores with automatically generated merchant accounts.</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsStoreModalOpen(true)} style={{ width: 'fit-content' }}>
                      + Add New Store
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card animate-fade-in" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Platform Users Directory</h2>
                <button className="btn btn-secondary" onClick={() => setIsUserModalOpen(true)} style={{ padding: '0.5rem 1rem' }}>
                  + Add User
                </button>
              </div>

              {/* User Filtering controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                  name="name"
                  placeholder="🔍 Search Name"
                  value={usersFilters.name}
                  onChange={handleUserFilterChange}
                  className="form-control"
                />
                <input
                  name="email"
                  placeholder="✉️ Search Email"
                  value={usersFilters.email}
                  onChange={handleUserFilterChange}
                  className="form-control"
                />
                <input
                  name="address"
                  placeholder="📍 Search Address"
                  value={usersFilters.address}
                  onChange={handleUserFilterChange}
                  className="form-control"
                />
                <select
                  name="role"
                  value={usersFilters.role}
                  onChange={handleUserFilterChange}
                  className="form-control"
                >
                  <option value="">All User Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>

              <SortableTable
                columns={userColumns}
                data={users}
                sortBy={usersSortBy}
                sortOrder={usersSortOrder}
                onSort={(key, order) => { setUsersSortBy(key); setUsersSortOrder(order); }}
                renderRow={(u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-inverse)' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</td>
                    <td>
                      <span className={u.role === 'Admin' ? 'badge badge-admin' : 'badge badge-user'}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleViewDetails(u.id)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}>
                        View Account
                      </button>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="glass-card animate-fade-in" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Registered Stores</h2>
                <button className="btn btn-primary" onClick={() => setIsStoreModalOpen(true)} style={{ padding: '0.5rem 1rem' }}>
                  + Add Store
                </button>
              </div>

              {/* Store Filtering controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                  name="name"
                  placeholder="🔍 Search Store Name"
                  value={storesFilters.name}
                  onChange={handleStoreFilterChange}
                  className="form-control"
                />
                <input
                  name="email"
                  placeholder="✉️ Search Store Email"
                  value={storesFilters.email}
                  onChange={handleStoreFilterChange}
                  className="form-control"
                />
                <input
                  name="address"
                  placeholder="📍 Search Store Address"
                  value={storesFilters.address}
                  onChange={handleStoreFilterChange}
                  className="form-control"
                />
              </div>

              <SortableTable
                columns={storeColumns}
                data={stores}
                sortBy={storesSortBy}
                sortOrder={storesSortOrder}
                onSort={(key, order) => { setStoresSortBy(key); setStoresSortOrder(order); }}
                renderRow={(s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-inverse)' }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StarRating rating={s.averageRating} size={15} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-inverse)' }}>
                          {s.averageRating > 0 ? s.averageRating : 'Unrated'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}
        </main>
      </div>

      {/* User Creation Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Create Platform User">
        {userFormApiError && (
          <div className="alert alert-danger" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{userFormApiError}</div>
        )}
        <form onSubmit={handleCreateUser}>
          <InputField
            label="Name (Min 2 characters)"
            name="name"
            value={userForm.name}
            onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
            error={userFormErrors.name}
            maxLength={60}
            required
          />
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={userForm.email}
            onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
            error={userFormErrors.email}
            required
          />
          <InputField
            label="Address"
            name="address"
            value={userForm.address}
            onChange={(e) => setUserForm(prev => ({ ...prev, address: e.target.value }))}
            error={userFormErrors.address}
            maxLength={400}
            isTextArea
            required
          />
          <InputField
            label="Password (8-16 characters, 1 uppercase, 1 special)"
            type="password"
            name="password"
            value={userForm.password}
            onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
            error={userFormErrors.password}
            required
          />
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
              className="form-control"
            >
              <option value="User">Normal User</option>
              <option value="Admin">System Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={userFormLoading}>
            {userFormLoading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </Modal>

      {/* Store Creation Modal */}
      <Modal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} title="Register Store & Owner">
        {storeFormApiError && (
          <div className="alert alert-danger" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{storeFormApiError}</div>
        )}
        <form onSubmit={handleCreateStore}>
          <InputField
            label="Store Name (Min 2 characters)"
            name="name"
            value={storeForm.name}
            onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
            error={storeFormErrors.name}
            maxLength={60}
            required
          />
          <InputField
            label="Store/Owner Email"
            type="email"
            name="email"
            value={storeForm.email}
            onChange={(e) => setStoreForm(prev => ({ ...prev, email: e.target.value }))}
            error={storeFormErrors.email}
            required
          />
          <InputField
            label="Store Address"
            name="address"
            value={storeForm.address}
            onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
            error={storeFormErrors.address}
            maxLength={400}
            isTextArea
            required
          />
          <InputField
            label="Store Owner Password (8-16 chars, 1 uppercase, 1 special)"
            type="password"
            name="password"
            value={storeForm.password}
            onChange={(e) => setStoreForm(prev => ({ ...prev, password: e.target.value }))}
            error={storeFormErrors.password}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={storeFormLoading}>
            {storeFormLoading ? 'Registering Store...' : 'Register Store'}
          </button>
        </form>
      </Modal>

      {/* User Details View Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Account Details">
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading account information...</div>
        ) : selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Account Name</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--text-inverse)' }}>{selectedUser.name}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
              <span style={{ color: 'var(--text-main)' }}>{selectedUser.email}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Registered Address</span>
              <span style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem' }}>{selectedUser.address}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>User Privilege</span>
              <span className={
                selectedUser.role === 'Admin' ? 'badge badge-admin' : 
                selectedUser.role === 'StoreOwner' ? 'badge badge-storeowner' : 
                'badge badge-user'
              }>
                {selectedUser.role}
              </span>
            </div>
            
            {/* If store owner details */}
            {selectedUser.role === 'StoreOwner' && (
              <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Owned Store Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StarRating rating={selectedUser.averageRating} size={22} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-inverse)' }}>
                    {selectedUser.averageRating > 0 ? `${selectedUser.averageRating} / 5.0` : 'No ratings yet'}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Store Name: <strong>{selectedUser.storeName}</strong>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--color-danger)' }}>Error loading details.</div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
