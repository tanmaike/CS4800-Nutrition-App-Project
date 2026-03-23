import React, { Component } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

class FoodCatalog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            filteredItems: [],
            searchTerm: '',
            searchCategory: 'name', // 'name', 'addedBy', 'date'
            loading: false,
            error: null,
            sortBy: 'newest', // 'newest', 'oldest', 'caloriesHigh', 'caloriesLow'
            selectedItem: null // For modal view
        };
    }

    componentDidMount() {
        this.fetchItems();
    }

    fetchItems = async () => {
        this.setState({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/items`);
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
        
        // First, filter items
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
        
        // Then, sort items
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

    render() {
        const { filteredItems, loading, error, searchTerm, searchCategory, sortBy, selectedItem } = this.state;
        
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>Food Catalog</h1>
                    <p style={styles.subtitle}>Browse and search through our collection of food items</p>
                </div>
                
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
                                                    Added By: {item.createdByUsername}
                                                </p>
                                            )}
                                            <p style={styles.date}>
                                                Date Added: {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                
                {/* Modal for Detailed View */}
                {selectedItem && (
                    <div style={styles.modalOverlay} onClick={this.closeItemModal}>
                        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <button style={styles.closeBtn} onClick={this.closeItemModal}>×</button>
                            
                            {/* Green Header Bar with Food Name */}
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>{selectedItem.name}</h2>
                            </div>
                            
                            <div style={styles.modalContent}>
                                {/* Basic Information Section */}
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>Basic Information</h3>
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
                                
                                {/* Macronutrients Section with Yellow Accents */}
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>Macronutrients (per 100g)</h3>
                                    <div style={styles.macroDetails}>
                                        {/* Protein Bar */}
                                        <div style={styles.macroBar}>
                                            <div style={styles.macroLabel}>
                                                <span style={styles.macroIcon}></span>
                                                Protein
                                            </div>
                                            <div style={styles.macroBarBg}>
                                                <div style={{
                                                    ...styles.macroBarFill,
                                                    width: `${Math.min((selectedItem.fcpAmount?.protein || 0) / 50 * 100, 100)}%`,
                                                    backgroundColor: '#ffc036'
                                                }}></div>
                                            </div>
                                            <div style={styles.macroValue}>{selectedItem.fcpAmount?.protein || 0}g</div>
                                        </div>
                                        
                                        {/* Carbs Bar */}
                                        <div style={styles.macroBar}>
                                            <div style={styles.macroLabel}>
                                                <span style={styles.macroIcon}></span>
                                                Carbohydrates
                                            </div>
                                            <div style={styles.macroBarBg}>
                                                <div style={{
                                                    ...styles.macroBarFill,
                                                    width: `${Math.min((selectedItem.fcpAmount?.carbs || 0) / 100 * 100, 100)}%`,
                                                    backgroundColor: '#ffc036'
                                                }}></div>
                                            </div>
                                            <div style={styles.macroValue}>{selectedItem.fcpAmount?.carbs || 0}g</div>
                                        </div>
                                        
                                        {/* Fat Bar */}
                                        <div style={styles.macroBar}>
                                            <div style={styles.macroLabel}>
                                                <span style={styles.macroIcon}></span>
                                                Fat
                                            </div>
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
                                    
                                    {/* Total Calories Breakdown */}
                                    <div style={styles.caloriesBreakdown}>
                                        <div style={styles.breakdownTitle}>Calorie Distribution</div>
                                        <div style={styles.breakdownBar}>
                                            <div style={{
                                                ...styles.breakdownFill,
                                                width: `${((selectedItem.fcpAmount?.protein || 0) * 4) / selectedItem.calories * 100}%`,
                                                backgroundColor: '#ffc036'
                                            }}></div>
                                            <div style={{
                                                ...styles.breakdownFill,
                                                width: `${((selectedItem.fcpAmount?.carbs || 0) * 4) / selectedItem.calories * 100}%`,
                                                backgroundColor: '#ffc036',
                                                opacity: 0.8
                                            }}></div>
                                            <div style={{
                                                ...styles.breakdownFill,
                                                width: `${((selectedItem.fcpAmount?.fat || 0) * 9) / selectedItem.calories * 100}%`,
                                                backgroundColor: '#ffc036',
                                                opacity: 0.6
                                            }}></div>
                                        </div>
                                        <div style={styles.breakdownLegend}>
                                            <span>Protein ({Math.round(((selectedItem.fcpAmount?.protein || 0) * 4) / selectedItem.calories * 100)}%)</span>
                                            <span>Carbs ({Math.round(((selectedItem.fcpAmount?.carbs || 0) * 4) / selectedItem.calories * 100)}%)</span>
                                            <span>Fat ({Math.round(((selectedItem.fcpAmount?.fat || 0) * 9) / selectedItem.calories * 100)}%)</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Additional Information Section */}
                                <div style={styles.modalSection}>
                                    <h3 style={styles.sectionTitle}>Additional Information</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoLabel}>Added by:</span>
                                            <span style={styles.infoText}>{selectedItem.createdByUsername || 'Unknown'}</span>
                                        </div>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoLabel}>Added on:</span>
                                            <span style={styles.infoText}>{new Date(selectedItem.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedItem.updatedAt && selectedItem.updatedAt !== selectedItem.createdAt && (
                                            <div style={styles.infoRow}>
                                                <span style={styles.infoLabel}>Last updated:</span>
                                                <span style={styles.infoText}>{new Date(selectedItem.updatedAt).toLocaleString()}</span>
                                            </div>
                                        )}
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

// Replace the styles object in FoodCatalog.jsx with:

const styles = {
    container: {
        maxWidth: '1200px',
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
        fontSize: '16px',
        fontFamily: 'inherit'
    },
    sortBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    sortLabel: {
        color: '#666'
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: 'white',
        fontFamily: 'inherit',
        cursor: 'pointer'
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
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        color: '#999',
        ':hover': {
            color: '#0c0c0c'
        }
    },
    modalTitle: {
        marginTop: 0,
        color: '#0c0c0c',
        fontSize: '28px'
    },
    modalContent: {
        marginTop: '20px'
    },
    modalSection: {
        marginBottom: '25px'
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
        height: '24px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '5px'
    },
    macroBarFill: {
        height: '100%',
        transition: 'width 0.3s ease'
    },
    macroValue: {
        fontSize: '12px',
        color: '#666',
        textAlign: 'right'
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
    },

    // Add to the styles object in FoodCatalog.jsx

    modalHeader: {
        backgroundColor: '#008550',
        padding: '20px',
        margin: '-30px -30px 20px -30px', // Negative margin to extend to modal edges
        borderRadius: '12px 12px 0 0',
        textAlign: 'center'
    },
    modalTitle: {
        margin: 0,
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    modalContent: {
        marginTop: '20px'
    },
    modalSection: {
        marginBottom: '30px',
        padding: '0 10px'
    },
    sectionTitle: {
        color: '#0c0c0c',
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '15px',
        borderLeft: `4px solid #ffc036`,
        paddingLeft: '12px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
    },
    infoCard: {
        backgroundColor: '#f5f5f5',
        padding: '12px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
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
        marginBottom: '20px'
    },
    macroLabel: {
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#0c0c0c',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    macroIcon: {
        fontSize: '16px'
    },
    macroBarBg: {
        backgroundColor: '#f0f0f0',
        height: '30px',
        borderRadius: '15px',
        overflow: 'hidden',
        marginBottom: '5px'
    },
    macroBarFill: {
        height: '100%',
        transition: 'width 0.3s ease',
        borderRadius: '15px'
    },
    macroValue: {
        fontSize: '13px',
        color: '#666',
        textAlign: 'right',
        fontWeight: 'bold'
    },
    caloriesBreakdown: {
        marginTop: '25px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
    },
    breakdownTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#666',
        marginBottom: '10px'
    },
    breakdownBar: {
        display: 'flex',
        height: '24px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '10px'
    },
    breakdownFill: {
        height: '100%',
        transition: 'width 0.3s ease'
    },
    breakdownLegend: {
        display: 'flex',
        gap: '15px',
        fontSize: '11px',
        color: '#666',
        flexWrap: 'wrap'
    },
    legendColor: {
        display: 'inline-block',
        width: '12px',
        height: '12px',
        borderRadius: '2px',
        marginRight: '5px',
        backgroundColor: '#ffc036'
    }
};

export default FoodCatalog;