import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import logo from '../assets/images/logo.png';

const Navigation = ({ currentPage, onPageChange, user, onLoginSuccess, onLogout }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [loginDisabled, setLoginDisabled] = useState(true); // Set to true to disable login
    const [tooltipText, setTooltipText] = useState('Registration temporarily disabled due to spam. Please check back later.');

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
        }
        setIsMobileMenuOpen(false);
    };

    const handlePageChangeWithClose = (page) => {
        onPageChange(page);
        setIsMobileMenuOpen(false);
    };

    // Mobile: Stacked layout with hamburger
    if (isMobile) {
        return (
            <>
                <nav style={styles.mobileNav}>
                    <div style={styles.mobileNavRow}>
                        <div style={styles.mobileLogo} onClick={() => handlePageChangeWithClose('catalog')}>
                            <img src={logo} alt="SJHF Logo" style={styles.mobileLogoImage} />
                            <span style={styles.mobileLogoText}>San Jose Hills Fitness</span>
                        </div>
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={styles.hamburgerBtn}
                            aria-label="Menu"
                        >
                            <span style={styles.hamburgerIcon}>{isMobileMenuOpen ? '✕' : '☰'}</span>
                        </button>
                    </div>
                    
                    {isMobileMenuOpen && (
                        <div style={styles.mobileMenu}>
                            <div style={styles.mobileNavLinks}>
                                <button
                                    onClick={() => handlePageChangeWithClose('catalog')}
                                    style={{
                                        ...styles.mobileNavButton,
                                        ...(currentPage === 'catalog' && styles.mobileActiveNavButton)
                                    }}
                                >
                                    📚 Food Catalog
                                </button>
                                <button
                                    onClick={() => handlePageChangeWithClose('distance')}
                                    style={{
                                        ...styles.mobileNavButton,
                                        ...(currentPage === 'distance' && styles.mobileActiveNavButton)
                                    }}
                                >
                                    📏 Distance Calculator
                                </button>
                            </div>
                            
                            {user ? (
                                <div style={styles.mobileUserInfo}>
                                    <span style={styles.mobileUserName}>👤 {user.displayName}</span>
                                    <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => {
                                        if (!loginDisabled) {
                                            setShowAuthModal(true);
                                            setIsMobileMenuOpen(false);
                                        }
                                    }} 
                                    style={{
                                        ...styles.mobileLoginBtn,
                                        ...(loginDisabled && styles.mobileLoginBtnDisabled)
                                    }}
                                    disabled={loginDisabled}
                                    title={loginDisabled ? "Login temporarily disabled" : ""}
                                >
                                    Login / Register
                                </button>
                            )}
                        </div>
                    )}
                </nav>
                <div style={styles.mobileNavSpacer} />
                
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
    }

    // Desktop: Horizontal three-column layout
    return (
        <>
            <nav style={styles.desktopNav}>
                {/* Left Section - Logo/Title */}
                <div style={styles.leftSection}>
                    <div style={styles.logo} onClick={() => handlePageChangeWithClose('catalog')}>
                        <img src={logo} alt="SJHF Logo" style={styles.logoImage} />
                        <span style={styles.logoText}>San Jose Hills Fitness</span>
                    </div>
                </div>
                
                {/* Center Section - Navigation Buttons */}
                <div style={styles.centerSection}>
                    <div style={styles.navLinks}>
                        <button
                            onClick={() => handlePageChangeWithClose('catalog')}
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
                            onClick={() => handlePageChangeWithClose('distance')}
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
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={styles.loginContainer}>
                        <button 
                            onClick={() => !loginDisabled && setShowAuthModal(true)}
                            style={{
                                ...styles.loginBtn,
                                ...(loginDisabled && styles.loginBtnDisabled)
                            }}
                            onMouseEnter={() => loginDisabled && setTooltipText('Registration temporarily disabled due to spam. Please check back later.')}
                            onMouseLeave={() => loginDisabled && setTooltipText('')}
                            disabled={loginDisabled}
                            title={loginDisabled ? "Login temporarily disabled" : ""}
                        >
                            Login / Register
                        </button>
                        {loginDisabled && tooltipText && (
                            <div style={styles.tooltip}>
                                {tooltipText}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </nav>
            
            <div style={styles.desktopNavSpacer} />
            
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
    // Desktop styles (3-column horizontal layout)
    desktopNav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        backgroundColor: '#008550',
        padding: '15px 30px',
        color: 'white',
        gap: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minHeight: '70px'
    },
    desktopNavSpacer: {
        height: '70px',
        width: '100%'
    },
    leftSection: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    centerSection: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightSection: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        color: 'white'
    },
    logoImage: {
        height: '32px',
        width: 'auto',
        objectFit: 'contain'
    },
    logoText: {
        fontSize: 'clamp(14px, 2vw, 20px)',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
    },
    navLinks: {
        display: 'flex',
        gap: '15px',
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
        whiteSpace: 'nowrap'
    },

    // Mobile styles (stacked vertical layout)
    mobileNav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#008550',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    mobileNavRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        minHeight: '60px'
    },
    mobileLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        flex: 1
    },
    mobileLogoImage: {
        height: '28px',
        width: 'auto',
        objectFit: 'contain'
    },
    mobileLogoText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'white'
    },
    hamburgerBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hamburgerIcon: {
        fontSize: '24px',
        color: 'white'
    },
    mobileMenu: {
        padding: '15px 20px',
        backgroundColor: '#008550',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    mobileNavLinks: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    mobileNavButton: {
        padding: '12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'white',
        textAlign: 'center',
        width: '100%'
    },
    mobileActiveNavButton: {
        backgroundColor: '#ffc036',
        color: '#0c0c0c'
    },
    mobileUserInfo: {
        borderTop: '1px solid rgba(255,255,255,0.2)',
        paddingTop: '15px',
        marginTop: '5px'
    },
    mobileUserName: {
        display: 'block',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '10px',
        textAlign: 'center'
    },
    mobileLoginBtn: {
        padding: '12px',
        backgroundColor: '#ffc036',
        color: '#0c0c0c',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        width: '100%',
        textAlign: 'center'
    },
    mobileLogoutBtn: {
        padding: '10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        width: '100%',
        textAlign: 'center'
    },
    mobileNavSpacer: {
        height: '120px', // Extra space for stacked mobile nav
        width: '100%'
    }, 
    loginContainer: {
        position: 'relative',
        display: 'inline-block'
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
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap'
    },
    
    loginBtnDisabled: {
        backgroundColor: '#cccccc',
        color: '#666666',
        cursor: 'not-allowed',
        opacity: 0.7
    },
    
    tooltip: {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '10px',
        padding: '8px 12px',
        backgroundColor: '#333',
        color: 'white',
        fontSize: '12px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    
    mobileLoginBtn: {
        padding: '12px',
        backgroundColor: '#ffc036',
        color: '#0c0c0c',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        width: '100%',
        textAlign: 'center'
    },
    
    mobileLoginBtnDisabled: {
        backgroundColor: '#cccccc',
        color: '#666666',
        cursor: 'not-allowed',
        opacity: 0.7
    }
};

export default Navigation;