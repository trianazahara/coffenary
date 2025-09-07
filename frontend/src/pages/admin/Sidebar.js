import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Coffee, ClipboardList, LogOut, Menu, X } from 'lucide-react';

const Sidebar = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const sidebarStyle = {
        width: '280px',
        backgroundColor: '#1f2937',
        background: 'linear-gradient(180deg, #1f2937 0%, #111827 50%, #1f2937 100%)',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid #374151',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
    };

    const mobileOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 30,
        display: window.innerWidth < 1024 && isMobileOpen ? 'block' : 'none'
    };

    const mobileSidebarStyle = {
        ...sidebarStyle,
        position: 'fixed',
        zIndex: 40,
        transform: window.innerWidth < 1024 ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out'
    };

    const logoStyle = {
        padding: '24px',
        borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const logoIconStyle = {
        width: '40px',
        height: '40px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    };

    const navStyle = {
        flex: 1,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        textDecoration: 'none',
        color: '#d1d5db',
        borderRadius: '12px',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden'
    };

    const activeLinkStyle = {
        ...linkStyle,
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
        color: '#10b981',
        borderLeft: '4px solid #10b981',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    };

    const hoverLinkStyle = {
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        color: '#ffffff',
        transform: 'translateX(4px)'
    };

    const iconContainerStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px',
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        transition: 'all 0.2s ease-in-out'
    };

    const activeIconContainerStyle = {
        ...iconContainerStyle,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
    };

    const logoutStyle = {
        padding: '16px',
        borderTop: '1px solid rgba(55, 65, 81, 0.5)'
    };

    const logoutButtonStyle = {
        ...linkStyle,
        width: '100%',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit'
    };

    const mobileButtonStyle = {
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 50,
        padding: '8px',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: window.innerWidth < 1024 ? 'block' : 'none',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'all 0.2s ease-in-out'
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleMobileSidebar}
                style={mobileButtonStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            <div
                style={mobileOverlayStyle}
                onClick={toggleMobileSidebar}
            />

            {/* Sidebar */}
            <aside style={window.innerWidth < 1024 ? mobileSidebarStyle : sidebarStyle}>
                {/* Logo Section */}
                <div style={logoStyle}>
                    <div style={logoIconStyle}>
                        <Coffee size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                            Coffenary
                        </h1>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            Admin Panel
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={navStyle}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        <li style={{ marginBottom: '8px' }}>
                            <NavLink
                                to="/admin/dashboard"
                                onClick={() => setIsMobileOpen(false)}
                                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                                onMouseEnter={(e) => {
                                    if (!e.target.closest('a').classList.contains('active')) {
                                        Object.assign(e.target.closest('a').style, hoverLinkStyle);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.closest('a').classList.contains('active')) {
                                        Object.assign(e.target.closest('a').style, linkStyle);
                                    }
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div style={isActive ? activeIconContainerStyle : iconContainerStyle}>
                                            <LayoutDashboard size={20} />
                                        </div>
                                        <span style={{ fontWeight: '500' }}>Dashboard</span>
                                        {!isActive && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '16px',
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '50%',
                                                opacity: 0,
                                                transition: 'opacity 0.2s ease-in-out'
                                            }} className="hover-dot" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <NavLink
                                to="/admin/menu"
                                onClick={() => setIsMobileOpen(false)}
                                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                                onMouseEnter={(e) => {
                                    if (!e.target.closest('a').classList.contains('active')) {
                                        Object.assign(e.target.closest('a').style, hoverLinkStyle);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.closest('a').classList.contains('active')) {
                                        Object.assign(e.target.closest('a').style, linkStyle);
                                    }
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div style={isActive ? activeIconContainerStyle : iconContainerStyle}>
                                            <Coffee size={20} />
                                        </div>
                                        <span style={{ fontWeight: '500' }}>Menu</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <NavLink
                                to="/admin/pemesanan"
                                onClick={() => setIsMobileOpen(false)}
                                style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
                                onMouseEnter={(e) => {
                                    if (!e.target.closest('a').classList.contains('active')) {
                                        Object.assign(e.target.closest('a').style, hoverLinkStyle);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.closest('a').classList.contains('active')) {
                                        Object.assign(e.target.closest('a').style, linkStyle);
                                    }
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div style={isActive ? activeIconContainerStyle : iconContainerStyle}>
                                            <ClipboardList size={20} />
                                        </div>
                                        <span style={{ fontWeight: '500' }}>Pemesanan</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Logout Section */}
                <div style={logoutStyle}>
                    <button
                        onClick={handleLogout}
                        style={logoutButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.target.style.color = '#ef4444';
                            e.target.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.target.style, logoutButtonStyle);
                        }}
                    >
                        <div style={{
                            ...iconContainerStyle,
                            backgroundColor: 'rgba(55, 65, 81, 0.5)'
                        }}>
                            <LogOut size={20} />
                        </div>
                        <span style={{ fontWeight: '500' }}>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;