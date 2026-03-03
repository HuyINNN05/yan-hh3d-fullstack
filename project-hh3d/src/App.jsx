import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout components
import Navbar       from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute   from './components/AdminRoute';

// Public pages
import Home     from './pages/Home';
import Detail   from './pages/Detail';
import Login    from './pages/login';
import Register from './pages/Register';

// Admin pages
import Dashboard from './pages/Admin/Dashboard';

function App() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Show Navbar only outside admin section */}
            {!isAdminPage && <Navbar />}

            <Routes>
                {/* Public */}
                <Route path="/"          element={<Home />} />
                <Route path="/movie/:id" element={<Detail />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />

                {/* Admin (requires login + admin role) */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <Dashboard />
                    </AdminRoute>
                } />
            </Routes>
        </div>
    );
}

export default App;