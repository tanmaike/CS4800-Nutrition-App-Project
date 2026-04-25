import React, { Component } from 'react';
import axios from 'axios';
import API_URL from '../config';

class FoodCatalog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            filteredItems: [],
            searchTerm: '',
            searchCategory: 'name',
            loading: false,
            error: null,
            sortBy: 'newest',
            selectedItem: null,
            showAddForm: false,
            newItem: {
                name: '',
                calories: '',
                quantity: '',
                fcpAmount: {
                    fat: '',
                    carbs: '',
                    protein: '',
                    unit: 'g'
                }
            },
            addingItem: false
        };
    }

    componentDidMount() {
        this.fetchItems();
    }

    fetchItems = async () => {
        this.setState({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/items`, {
                withCredentials: true
            });
            const items = Array.isArray(response.data) ? response.data : [];
            this.setState({ items, loading: false });
            this.applyFilters();
        } catch (error) {
            this.setState({ 
                error: 'Failed to fetch items: ' + error.message, 
                loading: false,
                items: []
            });
        }
    };

    handleSearchChange = (e) => {
        this.setState({ searchTerm: e.target.value }, () => {
            this.applyFilters();
        });
    };

    handleCategoryChange = (e) => {
        this.setState({ searchCategory: e.target.value }, () => {
            this.applyFilters();
        });
    };

    handleSortChange = (e) => {
        this.setState({ sortBy: e.target.value }, () => {
            this.applyFilters();
        });
    };

    applyFilters = () => {
        const { items, searchTerm, searchCategory, sortBy } = this.state;
        
        let filtered = [...items];
        
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => {
                switch(searchCategory) {
                    case 'name':
                        return item.name.toLowerCase().includes(term);
                    case 'addedBy':
                        return item.createdByUsername && 
                               item.createdByUsername.toLowerCase().includes(term);
                    case 'date':
                        const date = new Date(item.createdAt).toLocaleDateString();
                        return date.toLowerCase().includes(term);
                    default:
                        return item.name.toLowerCase().includes(term);
                }
            });
        }
        
        filtered.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'caloriesHigh':
                    return b.calories - a.calories;
                case 'caloriesLow':
                    return a.calories - b.calories;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
        
        this.setState({ filteredItems: filtered });
    };

    openItemModal = (item) => {
        this.setState({ selectedItem: item });
    };

    closeItemModal = () => {
        this.setState({ selectedItem: null });
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('fcpAmount.')) {
            const field = name.split('.')[1];
            this.setState(prevState => ({
                newItem: {
                    ...prevState.newItem,
                    fcpAmount: {
                        ...prevState.newItem.fcpAmount,
                        [field]: value
                    }
                }
            }));
        } else {
            this.setState(prevState => ({
                newItem: {
                    ...prevState.newItem,
                    [name]: value
                }
            }));
        }
    };

    addFoodItem = async (e) => {
        e.preventDefault();
        
        const { user } = this.props;
        
        if (!user) {
            this.setState({ error: 'Please login to add food items' });
            setTimeout(() => this.setState({ error: null }), 3000);
            return;
        }
        
        const { newItem } = this.state;
        
        // Validate inputs
        if (!newItem.name || !newItem.calories || !newItem.quantity) {
            this.setState({ error: 'Name, calories, and quantity are required' });
            return;
        }
        
        this.setState({ addingItem: true, error: null });
        
        try {
            const response = await axios.post(`${API_URL}/items`, {
                name: newItem.name,
                calories: parseFloat(newItem.calories),
                quantity: parseFloat(newItem.quantity),
                fcpAmount: {
                    fat: parseFloat(newItem.fcpAmount.fat) || 0,
                    carbs: parseFloat(newItem.fcpAmount.carbs) || 0,
                    protein: parseFloat(newItem.fcpAmount.protein) || 0,
                    unit: 'g'
                }
            }, {
                withCredentials: true
            });
            
            // Refresh the items list
            await this.fetchItems();
            
            // Reset form
            this.setState({
                showAddForm: false,
                addingItem: false,
                newItem: {
                    name: '',
                    calories: '',
                    quantity: '',
                    fcpAmount: {
                        fat: '',
                        carbs: '',
                        protein: '',
                        unit: 'g'
                    }
                },
                success: 'Food item added successfully!'
            });
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                this.setState({ success: null });
            }, 3000);
            
        } catch (error) {
            this.setState({ 
                error: error.response?.data?.message || 'Error adding food item',
                addingItem: false 
            });
        }
    };

    render() {
        const { filteredItems, loading, error, searchTerm, searchCategory, sortBy, selectedItem, showAddForm, newItem, addingItem, success } = this.state;
        const { user } = this.props;
        const isLoggedIn = !!user;
        
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>Food Catalog</h1>
                    <p style={styles.subtitle}>Browse, search, and add food items to our collection</p>
                </div>
                
                {/* Add Food Button - Only show if logged in */}
                {isLoggedIn && (
                    <div style={styles.addButtonContainer}>
                        <button 
                            onClick={() => this.setState({ showAddForm: !showAddForm })}
                            style={styles.addButton}
                        >
                            {showAddForm ? 'Cancel' : '+ Add New Food Item'}
                        </button>
                    </div>
                )}
                
                {/* Add Food Form - Only show if logged in */}
                {isLoggedIn && showAddForm && (
                    <form onSubmit={this.addFoodItem} style={styles.form}>
                        <h3 style={styles.formTitle}>Add New Food Item</h3>
                        
                        <div style={styles.formGroup}>
                            <label>Food Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={newItem.name}
                                onChange={this.handleInputChange}
                                required
                                style={styles.input}
                                placeholder="e.g., Apple, Chicken Breast, Quinoa"
                            />
                        </div>
                        
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Calories (kcal) *</label>
                                <input
                                    type="number"
                                    name="calories"
                                    value={newItem.calories}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    required
                                    style={styles.input}
                                    placeholder="e.g., 95"
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label>Serving Size (g) *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={newItem.quantity}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    required
                                    style={styles.input}
                                    placeholder="e.g., 100"
                                />
                            </div>
                        </div>
                        
                        <h4 style={styles.sectionTitle}>Macronutrients (per 100g)</h4>
                        
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Protein (g)</label>
                                <input
                                    type="number"
                                    name="fcpAmount.protein"
                                    value={newItem.fcpAmount.protein}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    style={styles.input}
                                    placeholder="e.g., 10"
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label>Carbohydrates (g)</label>
                                <input
                                    type="number"
                                    name="fcpAmount.carbs"
                                    value={newItem.fcpAmount.carbs}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    style={styles.input}
                                    placeholder="e.g., 25"
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label>Fat (g)</label>
                                <input
                                    type="number"
                                    name="fcpAmount.fat"
                                    value={newItem.fcpAmount.fat}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    style={styles.input}
                                    placeholder="e.g., 0.3"
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={addingItem}
                            style={styles.submitButton}
                        >
                            {addingItem ? 'Adding...' : 'Add Food Item'}
                        </button>
                    </form>
                )}
                
                {/* Login Prompt for Adding Items */}
                {!isLoggedIn && (
                    <div style={styles.loginPrompt}>
                        <p><strong>Want to add food items?</strong> Please login to add items to the catalog.</p>
                    </div>
                )}
                
                {/* Success Message */}
                {success && <div style={styles.success}>{success}</div>}
                
                {/* Search and Filter Controls */}
                <div style={styles.controls}>
                    <div style={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={this.handleSearchChange}
                            style={styles.searchInput}
                        />
                        <select 
                            value={searchCategory} 
                            onChange={this.handleCategoryChange}
                            style={styles.select}
                        >
                            <option value="name">Search by Name</option>
                            <option value="addedBy">Search by Added By</option>
                            <option value="date">Search by Date</option>
                        </select>
                    </div>
                    
                    <div style={styles.sortBox}>
                        <label style={styles.sortLabel}>Sort by:</label>
                        <select 
                            value={sortBy} 
                            onChange={this.handleSortChange}
                            style={styles.select}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="caloriesHigh">Highest Calories</option>
                            <option value="caloriesLow">Lowest Calories</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>
                
                {/* Stats */}
                {!loading && !error && (
                    <div style={styles.stats}>
                        Showing {filteredItems.length} of {this.state.items.length} items
                    </div>
                )}
                
                {/* Error Display */}
                {error && <div style={styles.error}>{error}</div>}
                
                {/* Loading Indicator */}
                {loading && <div style={styles.loading}>Loading food catalog...</div>}
                
                {/* Items Grid */}
                {!loading && !error && (
                    <div style={styles.grid}>
                        {filteredItems.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p>No food items found.</p>
                                {searchTerm && <p>Try a different search term!</p>}
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div 
                                    key={item._id} 
                                    style={styles.card}
                                    onClick={() => this.openItemModal(item)}
                                >
                                    <h3 style={styles.cardTitle}>{item.name}</h3>
                                    <div style={styles.cardContent}>
                                        <div style={styles.nutritionSummary}>
                                            <div style={styles.nutritionItem}>
                                                <span style={styles.nutritionLabel}>Calories</span>
                                                <span style={styles.nutritionValue}>{item.calories}</span>
                                            </div>
                                            <div style={styles.nutritionItem}>
                                                <span style={styles.nutritionLabel}>Protein</span>
                                                <span style={styles.nutritionValue}>{item.fcpAmount?.protein || 0}g</span>
                                            </div>
                                            <div style={styles.nutritionItem}>
                                                <span style={styles.nutritionLabel}>Carbs</span>
                                                <span style={styles.nutritionValue}>{item.fcpAmount?.carbs || 0}g</span>
                                            </div>
                                            <div style={styles.nutritionItem}>
                                                <span style={styles.nutritionLabel}>Fat</span>
                                                <span style={styles.nutritionValue}>{item.fcpAmount?.fat || 0}g</span>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.metadata}>
                                            {item.createdByUsername && (
                                                <p style={styles.creator}>
                                                    👤 {item.createdByUsername}
                                                </p>
                                            )}
                                            <p style={styles.date}>
                                                📅 {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                
                {/* Modal for Detailed View - Same as before */}
                {selectedItem && (
                    <div style={styles.modalOverlay} onClick={this.closeItemModal}>
                        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <button style={styles.closeBtn} onClick={this.closeItemModal}>×</button>
                            
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>{selectedItem.name}</h2>
                            </div>
                            
                            <div style={styles.modalContent}>
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>📊 Basic Information</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoCard}>
                                            <span style={styles.infoLabel}>Calories</span>
                                            <span style={styles.infoValue}>{selectedItem.calories} kcal</span>
                                        </div>
                                        <div style={styles.infoCard}>
                                            <span style={styles.infoLabel}>Serving Size</span>
                                            <span style={styles.infoValue}>{selectedItem.quantity}g</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>🥗 Macronutrients (per 100g)</h3>
                                    <div style={styles.macroDetails}>
                                        <div style={styles.macroBar}>
                                            <div style={styles.macroLabel}>💪 Protein</div>
                                            <div style={styles.macroBarBg}>
                                                <div style={{
                                                    ...styles.macroBarFill,
                                                    width: `${Math.min((selectedItem.fcpAmount?.protein || 0) / 50 * 100, 100)}%`,
                                                    backgroundColor: '#ffc036'
                                                }}></div>
                                            </div>
                                            <div style={styles.macroValue}>{selectedItem.fcpAmount?.protein || 0}g</div>
                                        </div>
                                        <div style={styles.macroBar}>
                                            <div style={styles.macroLabel}>🌾 Carbohydrates</div>
                                            <div style={styles.macroBarBg}>
                                                <div style={{
                                                    ...styles.macroBarFill,
                                                    width: `${Math.min((selectedItem.fcpAmount?.carbs || 0) / 100 * 100, 100)}%`,
                                                    backgroundColor: '#ffc036'
                                                }}></div>
                                            </div>
                                            <div style={styles.macroValue}>{selectedItem.fcpAmount?.carbs || 0}g</div>
                                        </div>
                                        <div style={styles.macroBar}>
                                            <div style={styles.macroLabel}>🥑 Fat</div>
                                            <div style={styles.macroBarBg}>
                                                <div style={{
                                                    ...styles.macroBarFill,
                                                    width: `${Math.min((selectedItem.fcpAmount?.fat || 0) / 50 * 100, 100)}%`,
                                                    backgroundColor: '#ffc036'
                                                }}></div>
                                            </div>
                                            <div style={styles.macroValue}>{selectedItem.fcpAmount?.fat || 0}g</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>ℹ️ Additional Information</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoLabel}>Added by:</span>
                                            <span style={styles.infoText}>{selectedItem.createdByUsername || 'Unknown'}</span>
                                        </div>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoLabel}>Added on:</span>
                                            <span style={styles.infoText}>{new Date(selectedItem.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

// Styles - Add new styles while keeping existing ones
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
    addButtonContainer: {
        textAlign: 'right',
        marginBottom: '20px'
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#008550',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s ease'
    },
    form: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
    },
    formTitle: {
        marginTop: 0,
        marginBottom: '20px',
        color: '#0c0c0c'
    },
    formRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px'
    },
    formGroup: {
        flex: 1,
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        marginTop: '5px'
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        marginTop: '5px',
        backgroundColor: 'white'
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#008550',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        width: '100%'
    },
    loginPrompt: {
        backgroundColor: '#fff9e6',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        borderLeft: `4px solid #ffc036`
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
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    searchBox: {
        display: 'flex',
        gap: '10px',
        flex: '2'
    },
    searchInput: {
        flex: '2',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    sortBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    sortLabel: {
        color: '#666'
    },
    stats: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '20px',
        fontSize: '14px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
    },
    card: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
    },
    cardTitle: {
        margin: '0 0 15px 0',
        color: '#0c0c0c',
        fontSize: '20px',
        borderBottom: '2px solid #ffc036',
        paddingBottom: '8px'
    },
    cardContent: {
        color: '#0c0c0c'
    },
    nutritionSummary: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '15px'
    },
    nutritionItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '5px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
    },
    nutritionLabel: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#666'
    },
    nutritionValue: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#0c0c0c'
    },
    metadata: {
        borderTop: '1px solid #eee',
        paddingTop: '10px',
        marginTop: '10px',
        fontSize: '12px'
    },
    creator: {
        margin: '5px 0',
        color: '#666'
    },
    date: {
        margin: '5px 0',
        color: '#999'
    },
    modalOverlay: {
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
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
    },
    modalHeader: {
        backgroundColor: '#008550',
        padding: '20px',
        borderRadius: '12px 12px 0 0'
    },
    modalTitle: {
        margin: 0,
        color: 'white',
        fontSize: '24px'
    },
    modalContent: {
        padding: '20px'
    },
    modalSection: {
        marginBottom: '20px'
    },
    infoGrid: {
        display: 'grid',
        gap: '10px'
    },
    infoCard: {
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    infoRow: {
        backgroundColor: '#f9f9f9',
        padding: '10px',
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    infoLabel: {
        fontWeight: 'bold',
        color: '#666',
        fontSize: '13px'
    },
    infoValue: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#008550'
    },
    infoText: {
        color: '#0c0c0c'
    },
    macroDetails: {
        marginTop: '10px'
    },
    macroBar: {
        marginBottom: '15px'
    },
    macroLabel: {
        marginBottom: '5px',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#0c0c0c'
    },
    macroBarBg: {
        backgroundColor: '#f0f0f0',
        height: '30px',
        borderRadius: '15px',
        overflow: 'hidden'
    },
    macroBarFill: {
        height: '100%',
        transition: 'width 0.3s ease',
        borderRadius: '15px'
    },
    macroValue: {
        fontSize: '12px',
        color: '#666',
        textAlign: 'right',
        marginTop: '5px'
    },
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: 'white',
        zIndex: 1
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    loading: {
        backgroundColor: '#e3f2fd',
        color: '#1565c0',
        padding: '10px',
        borderRadius: '4px',
        textAlign: 'center'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#999'
    }
};

// Add at the end of the styles object
// Mobile responsive overrides
const mobileStyles = `
@media (max-width: 768px) {
    .food-catalog-grid {
        grid-template-columns: 1fr !important;
    }
    
    .food-catalog-controls {
        flex-direction: column !important;
    }
    
    .food-catalog-search {
        width: 100% !important;
    }
    
    .food-catalog-sort {
        width: 100% !important;
    }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = mobileStyles;
    document.head.appendChild(styleSheet);
}

export default FoodCatalog;