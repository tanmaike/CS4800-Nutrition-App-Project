import React, { Component } from 'react';
import API_URL from '../config';
import axios from '../axiosConfig';

class AuthModal extends Component {
    state = {
        isLogin: true,
        username: '',
        password: '',
        displayName: '',
        error: null,
        fieldErrors: {},  // Initialize as empty object
        loading: false
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, error: null, fieldErrors: {} });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ loading: true, error: null, fieldErrors: {} });
        
        const { isLogin, username, password, displayName } = this.state;
        
        try {
            if (isLogin) {
                const response = await axios.post(`${API_URL}/users/login`, {
                    username,
                    password
                }, {
                    withCredentials: true
                });
                this.props.onLoginSuccess(response.data.user);
                this.props.onClose();
            } else {
                const response = await axios.post(`${API_URL}/users/register`, {
                    username,
                    password,
                    displayName
                }, {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    this.props.onLoginSuccess(response.data.user);
                    this.props.onClose();
                }
            }
        } catch (error) {
            console.error('Auth error:', error.response?.data);
            
            if (error.response?.data?.errors) {
                this.setState({ 
                    fieldErrors: error.response.data.errors,
                    error: error.response.data.message,
                    loading: false 
                });
            } else if (error.response?.data?.message) {
                this.setState({ 
                    error: error.response.data.message,
                    loading: false 
                });
            } else {
                this.setState({ 
                    error: 'Authentication failed. Please check your connection.',
                    loading: false 
                });
            }
        }
    };

    toggleMode = () => {
        this.setState(prevState => ({
            isLogin: !prevState.isLogin,
            error: null,
            fieldErrors: {},
            username: '',
            password: '',
            displayName: ''
        }));
    };

    render() {
        const { isLogin, username, password, displayName, error, fieldErrors = {}, loading } = this.state;
        
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
                                style={{
                                    ...styles.input,
                                    ...(fieldErrors?.username && styles.inputError)
                                }}
                            />
                            {fieldErrors?.username && (
                                <div style={styles.fieldError}>{fieldErrors.username}</div>
                            )}
                            {!isLogin && !fieldErrors?.username && (
                                <div style={styles.hint}>
                                    Username: 3-30 characters, letters/numbers/underscores only
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={this.handleInputChange}
                                required
                                style={{
                                    ...styles.input,
                                    ...(fieldErrors?.password && styles.inputError)
                                }}
                            />
                            {fieldErrors?.password && (
                                <div style={styles.fieldError}>{fieldErrors.password}</div>
                            )}
                            {!isLogin && !fieldErrors?.password && (
                                <div style={styles.hint}>
                                    Password must be at least 6 characters with letters and numbers
                                </div>
                            )}
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
                                    style={{
                                        ...styles.input,
                                        ...(fieldErrors?.displayName && styles.inputError)
                                    }}
                                />
                                {fieldErrors?.displayName && (
                                    <div style={styles.fieldError}>{fieldErrors.displayName}</div>
                                )}
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
        marginTop: '5px'
    },
    inputError: {
        borderColor: '#c62828',
        backgroundColor: '#ffebee'
    },
    fieldError: {
        color: '#c62828',
        fontSize: '12px',
        marginTop: '5px'
    },
    hint: {
        color: '#666',
        fontSize: '11px',
        marginTop: '5px'
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px'
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
        color: '#4CAF50',
        cursor: 'pointer',
        textDecoration: 'underline'
    }
};

export default AuthModal;