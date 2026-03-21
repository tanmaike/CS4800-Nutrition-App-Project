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
                   UCNFC
                </div>
                
                <div style={styles.navLinks}>
                    <button
                        onClick={() => onPageChange('catalog')}
                        style={{
                            ...styles.navButton,
                            ...(currentPage === 'catalog' && styles.activeNavButton)
                        }}
                    >
                        Food Catalog
                    </button>
                    <button
                        onClick={() => onPageChange('add')}
                        style={{
                            ...styles.navButton,
                            ...(currentPage === 'add' && styles.activeNavButton)
                        }}
                    >
                        Add Food Item
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
        backgroundColor: '#008550',
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
        backgroundColor: '#006b40',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s'
    },
    activeNavButton: {
        backgroundColor: '#FFC036',
        color: "black",
        borderColor: '#black'
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
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    loginBtn: {
        padding: '8px 16px',
        backgroundColor: '#97edcb',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s'
    },
    logoutBtn: {
        padding: '6px 12px',
        backgroundColor: '#b52b4c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background-color 0.3s'
    }
};

export default Navigation;