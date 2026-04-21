import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.content}>
                    <p style={styles.text}>
                        Created by Miah Terrazas, c. {currentYear}
                    </p>
                    <p style={styles.linkContainer}>
                        <a 
                            href="https://github.com/tanmaike/CS4800-Nutrition-App-Project" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.link}
                        >
                            GitHub
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        padding: '20px 0',
        marginTop: '50px',
        width: '100%'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },
    content: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
    },
    text: {
        margin: 0,
        color: '#666',
        fontSize: '14px'
    },
    linkContainer: {
        margin: 0
    },
    link: {
        color: '#008550',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
    }
};

// Add hover effect
const linkHover = `
    a:hover {
        color: #006340;
        text-decoration: underline;
    }
`;

// Inject hover styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = linkHover;
    document.head.appendChild(styleSheet);
}

export default Footer;