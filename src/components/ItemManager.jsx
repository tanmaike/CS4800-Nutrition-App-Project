import React, { Component } from 'react';
import axios from 'axios';

const API_URL = '/api';

class ItemManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentItem: {
                name: '',
                calories: 0,
                quantity: 0,
                fcpAmount: {
                    fat: 0,
                    carbs: 0,
                    protein: 0,
                    unit: 'g'
                }
            },
            loading: false,
            error: null,
            success: null
        };
    }

    createItem = async (e) => {
        e.preventDefault();
        
        if (!this.props.user) {
            // User should be redirected to login via navigation
            this.setState({ error: 'Please login to add items' });
            setTimeout(() => this.setState({ error: null }), 3000);
            return;
        }
        
        this.setState({ loading: true, error: null, success: null });
        try {
            const response = await axios.post(`${API_URL}/items`, this.state.currentItem, {
                withCredentials: true
            });
            this.setState({
                currentItem: {
                    name: '',
                    calories: 0,
                    quantity: 0,
                    fcpAmount: {
                        fat: 0,
                        carbs: 0,
                        protein: 0,
                        unit: 'g'
                    }
                },
                loading: false,
                success: '✅ Food item added successfully!'
            });
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                this.setState({ success: null });
            }, 3000);
            
            // Notify parent to refresh catalog
            if (this.props.onItemAdded) {
                this.props.onItemAdded();
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.setState({ 
                    error: 'Please login to add items', 
                    loading: false 
                });
            } else {
                this.setState({ 
                    error: 'Failed to create item: ' + error.message, 
                    loading: false 
                });
            }
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('fcpAmount.')) {
            const field = name.split('.')[1];
            this.setState(prevState => ({
                currentItem: {
                    ...prevState.currentItem,
                    fcpAmount: {
                        ...prevState.currentItem.fcpAmount,
                        [field]: parseFloat(value) || 0
                    }
                }
            }));
        } else {
            this.setState(prevState => ({
                currentItem: {
                    ...prevState.currentItem,
                    [name]: name === 'name' ? value : (parseFloat(value) || 0)
                }
            }));
        }
    };

    render() {
        const { currentItem, loading, error, success } = this.state;
        const { user } = this.props;
        const isLoggedIn = !!user;
        
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>Add New Food Item</h1>
                    <p style={styles.subtitle}>
                        {isLoggedIn 
                            ? "Share nutritious food items with our community" 
                            : "Please login to add items to our catalog"}
                    </p>
                </div>
                
                {/* Success Message */}
                {success && <div style={styles.success}>{success}</div>}
                
                {/* Error Display */}
                {error && <div style={styles.error}>{error}</div>}

                {/* Form */}
                <form onSubmit={this.createItem} style={styles.form}>
                    {!isLoggedIn && (
                        <div style={styles.authOverlay}>
                            <p style={styles.authMessage}>
                                You need to be logged in to add food items
                            </p>
                            <p style={styles.authHint}>
                                Click "Login / Register" in the navigation bar above
                            </p>
                        </div>
                    )}
                    
                    <div style={styles.formGroup}>
                        <label>Food Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={currentItem.name}
                            onChange={this.handleInputChange}
                            required
                            disabled={!isLoggedIn}
                            placeholder="e.g., Apple, Chicken Breast, Quinoa"
                            style={{...styles.input, ...(!isLoggedIn && styles.disabled)}}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label>Calories (kcal) *</label>
                            <input
                                type="number"
                                name="calories"
                                value={currentItem.calories}
                                onChange={this.handleInputChange}
                                min="0"
                                step="1"
                                required
                                disabled={!isLoggedIn}
                                style={{...styles.input, ...(!isLoggedIn && styles.disabled)}}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Serving Size (grams) *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={currentItem.quantity}
                                onChange={this.handleInputChange}
                                min="0"
                                step="1"
                                required
                                disabled={!isLoggedIn}
                                style={{...styles.input, ...(!isLoggedIn && styles.disabled)}}
                            />
                        </div>
                    </div>

                    <h3 style={styles.sectionTitle}>Macronutrients (per 100g)</h3>
                    
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label>Protein (g)</label>
                            <input
                                type="number"
                                name="fcpAmount.protein"
                                value={currentItem.fcpAmount.protein}
                                onChange={this.handleInputChange}
                                min="0"
                                step="0.1"
                                disabled={!isLoggedIn}
                                style={{...styles.input, ...(!isLoggedIn && styles.disabled)}}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Carbohydrates (g)</label>
                            <input
                                type="number"
                                name="fcpAmount.carbs"
                                value={currentItem.fcpAmount.carbs}
                                onChange={this.handleInputChange}
                                min="0"
                                step="0.1"
                                disabled={!isLoggedIn}
                                style={{...styles.input, ...(!isLoggedIn && styles.disabled)}}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Fat (g)</label>
                            <input
                                type="number"
                                name="fcpAmount.fat"
                                value={currentItem.fcpAmount.fat}
                                onChange={this.handleInputChange}
                                min="0"
                                step="0.1"
                                disabled={!isLoggedIn}
                                style={{...styles.input, ...(!isLoggedIn && styles.disabled)}}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !isLoggedIn} 
                        style={{...styles.button, ...((loading || !isLoggedIn) && styles.disabledBtn)}}
                    >
                        {loading ? 'Adding...' : (isLoggedIn ? 'Add Food Item' : 'Login to Add Items')}
                    </button>
                    
                    {!isLoggedIn && (
                        <p style={styles.loginPrompt}>
                            Click "Login / Register" in the navigation bar to start adding items
                        </p>
                    )}
                </form>
            </div>
        );
    }
}

// Replace the styles object in ItemManager.jsx with:

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
        backgroundColor: 'white',
        color: '#0c0c0c'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    subtitle: {
        color: '#666',
        fontSize: '14px',
        marginTop: '8px'
    },
    form: {
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '8px',
        position: 'relative'
    },
    authOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.98)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        zIndex: 10,
        textAlign: 'center'
    },
    authMessage: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#666'
    },
    authHint: {
        fontSize: '14px',
        color: '#999'
    },
    formGroup: {
        marginBottom: '20px',
        flex: 1
    },
    formRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '0'
    },
    input: {
        width: '100%',
        padding: '10px',
        marginTop: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    },
    disabled: {
        backgroundColor: '#f0f0f0',
        cursor: 'not-allowed',
        opacity: 0.6
    },
    button: {
        width: '100%',
        backgroundColor: '#008550',
        color: 'white',
        padding: '12px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
        fontFamily: 'inherit',
        fontWeight: '500'
    },
    disabledBtn: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
    },
    sectionTitle: {
        marginTop: '20px',
        marginBottom: '15px',
        color: '#0c0c0c'
    },
    success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    loginPrompt: {
        marginTop: '15px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#999'
    }
};

export default ItemManager;