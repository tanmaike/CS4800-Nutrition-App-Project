import React, { useState } from 'react';
import AuthModal from './AuthModal';

const Navigation = ({ currentPage, onPageChange, user, onLoginSuccess, onLogout }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
        }
    };

    return (
        <>
            <nav style={styles.nav}>
                <div style={styles.logo}>
                    🍎 Nutrition App
                </div>
                
                <div style={styles.navLinks}>
                    <button
                        onClick={() => onPageChange('catalog')}
                        style={{
                            ...styles.navButton,
                            ...(currentPage === 'catalog' && styles.activeNavButton)
                        }}
                    >
                        📚 Food Catalog
                    </button>
                    <button
                        onClick={() => onPageChange('add')}
                        style={{
                            ...styles.navButton,
                            ...(currentPage === 'add' && styles.activeNavButton)
                        }}
                    >
                        ➕ Add Food Item
                    </button>
                </div>
                
                <div style={styles.userSection}>
                    {user ? (
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>
                                👤 {user.displayName}
                            </span>
                            <button 
                                onClick={handleLogout}
                                style={styles.logoutBtn}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowAuthModal(true)}
                            style={styles.loginBtn}
                        >
                            Login / Register
                        </button>
                    )}
                </div>
            </nav>
            
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onLoginSuccess={(user) => {
                        setShowAuthModal(false);
                        if (onLoginSuccess) {
                            onLoginSuccess(user);
                        }
                    }}
                />
            )}
        </>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
        padding: '15px 30px',
        color: 'white',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logo: {
        fontSize: '20px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    navLinks: {
        display: 'flex',
        gap: '10px'
    },
    navButton: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s'
    },
    activeNavButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50'
    },
    userSection: {
        display: 'flex',
        alignItems: 'center'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    userName: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    loginBtn: {
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s'
    },
    logoutBtn: {
        padding: '6px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background-color 0.3s'
    }
};

export default Navigation;