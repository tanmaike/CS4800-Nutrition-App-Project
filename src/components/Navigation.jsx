import React, { useState } from 'react';
import AuthModal from './AuthModal';
import API_URL from '../config';

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
                {/* Left Section - Logo/Title */}
                <div style={styles.leftSection}>
                    <div style={styles.logo}>
                        San Jose Hills Fitness
                    </div>
                </div>
                
                {/* Center Section - Navigation Buttons */}
                <div style={styles.centerSection}>
                    <div style={styles.navLinks}>
                        <button
                            onClick={() => onPageChange('catalog')}
                            style={{
                                ...styles.navButton,
                                ...(currentPage === 'catalog' && styles.activeNavButton),
                                ...(currentPage !== 'catalog' && styles.inactiveNavButton)
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== 'catalog') {
                                    e.target.style.backgroundColor = '#006340';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== 'catalog') {
                                    e.target.style.backgroundColor = '#008550';
                                }
                            }}
                        >
                            📚 Food Catalog
                        </button>
                        <button
                            onClick={() => onPageChange('distance')}
                            style={{
                                ...styles.navButton,
                                ...(currentPage === 'distance' && styles.activeNavButton),
                                ...(currentPage !== 'distance' && styles.inactiveNavButton)
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== 'distance') {
                                    e.target.style.backgroundColor = '#006340';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== 'distance') {
                                    e.target.style.backgroundColor = '#008550';
                                }
                            }}
                        >
                            📏 Distance Calculator
                        </button>
                    </div>
                    
                </div>
                
                {/* Right Section - User Authentication */}
                <div style={styles.rightSection}>
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
        gap: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minHeight: '70px',
        flexWrap: 'wrap'
    },
    leftSection: {
        flex: '0 0 auto',  // Don't grow or shrink
        display: 'flex',
        alignItems: 'center'
    },
    centerSection: {
        flex: '1 1 auto',  // Can grow and shrink
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightSection: {
        flex: '0 0 auto',  // Don't grow or shrink
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    logo: {
        fontSize: '20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: 'white',
        whiteSpace: 'nowrap'
    },
    navLinks: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    navButton: {
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        border: 'none',
        transition: 'all 0.3s ease',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    activeNavButton: {
        backgroundColor: '#ffc036',
        color: '#0c0c0c'
    },
    inactiveNavButton: {
        backgroundColor: '#008550',
        color: 'white'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    userName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        whiteSpace: 'nowrap'
    },
    loginBtn: {
        padding: '8px 16px',
        backgroundColor: '#ffc036',
        color: '#0c0c0c',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.3s ease',
        whiteSpace: 'nowrap'
    },
    logoutBtn: {
        padding: '6px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background-color 0.3s ease',
        whiteSpace: 'nowrap'
    },
    // Responsive design
    '@media (max-width: 768px)': {
        nav: {
            flexDirection: 'column',
            gap: '15px',
            textAlign: 'center'
        },
        leftSection: {
            justifyContent: 'center'
        },
        centerSection: {
            width: '100%'
        },
        rightSection: {
            justifyContent: 'center'
        },
        userInfo: {
            justifyContent: 'center'
        }
    }
};

export default Navigation;