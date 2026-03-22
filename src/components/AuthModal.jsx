import React, { Component } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

class AuthModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: true,
            username: '',
            password: '',
            displayName: '',
            error: null,
            loading: false
        };
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, error: null });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ loading: true, error: null });
        
        const { isLogin, username, password, displayName } = this.state;
        
        try {
            if (isLogin) {
                const response = await axios.post(`${API_URL}/users/login`, {
                    username,
                    password
                }, {
                    withCredentials: true // Important for sessions
                });
                this.props.onLoginSuccess(response.data.user);
            } else {
                const response = await axios.post(`${API_URL}/users/register`, {
                    username,
                    password,
                    displayName
                }, {
                    withCredentials: true
                });
                this.props.onLoginSuccess(response.data.user);
            }
            this.props.onClose();
        } catch (error) {
            this.setState({
                error: error.response?.data?.message || 'Authentication failed',
                loading: false
            });
        }
    };

    toggleMode = () => {
        this.setState(prevState => ({
            isLogin: !prevState.isLogin,
            error: null,
            username: '',
            password: '',
            displayName: ''
        }));
    };

    render() {
        const { isLogin, username, password, displayName, error, loading } = this.state;
        
        return (
            <div style={styles.overlay} onClick={this.props.onClose}>
                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <button style={styles.closeBtn} onClick={this.props.onClose}>×</button>
                    
                    <h2 style={styles.title}>{isLogin ? 'Login' : 'Create Account'}</h2>
                    
                    {error && <div style={styles.error}>{error}</div>}
                    
                    <form onSubmit={this.handleSubmit}>
                        <div style={styles.formGroup}>
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={this.handleInputChange}
                                required
                                style={styles.input}
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={this.handleInputChange}
                                required
                                minLength="6"
                                style={styles.input}
                            />
                        </div>
                        
                        {!isLogin && (
                            <div style={styles.formGroup}>
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={displayName}
                                    onChange={this.handleInputChange}
                                    required
                                    style={styles.input}
                                />
                            </div>
                        )}
                        
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>
                    
                    <div style={styles.toggle}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={this.toggleMode} style={styles.toggleBtn}>
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

// Update the styles object in AuthModal.jsx:

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#999'
    },
    title: {
        marginBottom: '20px',
        textAlign: 'center',
        color: '#0c0c0c'
    },
    formGroup: {
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        marginTop: '5px',
        fontFamily: 'inherit'
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#008550',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
        fontFamily: 'inherit',
        fontWeight: '500'
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px'
    },
    toggle: {
        marginTop: '20px',
        textAlign: 'center'
    },
    toggleBtn: {
        background: 'none',
        border: 'none',
        color: '#008550',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontFamily: 'inherit'
    }
};

export default AuthModal;