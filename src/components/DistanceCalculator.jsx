import React, { Component } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

class DistanceCalculator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            originId: '',
            destinationId: '',
            result: null,
            loading: false,
            error: null,
            showForm: false,
            newLocation: {
                name: '',
                lat: '',
                lng: '',
                isPublic: true
            },
            addingLocation: false
        };
    }

    componentDidMount() {
        this.fetchLocations();
    }

    fetchLocations = async () => {
        try {
            const response = await axios.get(`${API_URL}/locations`, {
                withCredentials: true
            });
            this.setState({ locations: response.data });
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    handleDistanceCalculation = async (e) => {
        e.preventDefault();
        const { originId, destinationId } = this.state;
        
        if (!originId || !destinationId) {
            this.setState({ error: 'Please select both origin and destination' });
            return;
        }
        
        this.setState({ loading: true, error: null, result: null });
        
        try {
            const response = await axios.post(`${API_URL}/calculate-distance`, {
                originId,
                destinationId
            }, {
                withCredentials: true
            });
            
            this.setState({ result: response.data, loading: false });
        } catch (error) {
            this.setState({ 
                error: error.response?.data?.message || 'Error calculating distance',
                loading: false 
            });
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            newLocation: {
                ...prevState.newLocation,
                [name]: value
            }
        }));
    };

    addLocation = async (e) => {
        e.preventDefault();
        const { newLocation, addingLocation } = this.state;
        
        // Check if user is logged in
        if (!this.props.user) {
            this.setState({ error: 'Please login to add locations' });
            return;
        }
        
        if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
            this.setState({ error: 'Name and coordinates are required' });
            return;
        }
        
        // Validate coordinates
        const lat = parseFloat(newLocation.lat);
        const lng = parseFloat(newLocation.lng);
        
        if (isNaN(lat) || lat < -90 || lat > 90) {
            this.setState({ error: 'Invalid latitude. Must be between -90 and 90' });
            return;
        }
        
        if (isNaN(lng) || lng < -180 || lng > 180) {
            this.setState({ error: 'Invalid longitude. Must be between -180 and 180' });
            return;
        }
        
        this.setState({ addingLocation: true, error: null });
        
        try {
            await axios.post(`${API_URL}/locations`, {
                name: newLocation.name,
                coordinates: { lat, lng },
                isPublic: newLocation.isPublic
            }, {
                withCredentials: true
            });
            
            // Refresh locations
            await this.fetchLocations();
            
            this.setState({
                showForm: false,
                addingLocation: false,
                newLocation: {
                    name: '',
                    lat: '',
                    lng: '',
                    isPublic: true
                }
            });
        } catch (error) {
            this.setState({ 
                error: error.response?.data?.message || 'Error adding location',
                addingLocation: false 
            });
        }
    };

    render() {
        const { locations, originId, destinationId, result, loading, error, showForm, newLocation, addingLocation } = this.state;
        const { user } = this.props;
        const isLoggedIn = !!user;
        
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>📍 Distance Calculator</h1>
                    <p style={styles.subtitle}>Calculate distances between locations in miles and steps</p>
                </div>
                
                {/* Add Location Button - Only show if logged in */}
                {isLoggedIn && (
                    <div style={styles.addButtonContainer}>
                        <button 
                            onClick={() => this.setState({ showForm: !showForm })}
                            style={styles.addButton}
                        >
                            {showForm ? 'Cancel' : '+ Add New Location'}
                        </button>
                    </div>
                )}
                
                {/* Add Location Form - Only show if logged in */}
                {isLoggedIn && showForm && (
                    <form onSubmit={this.addLocation} style={styles.form}>
                        <h3 style={styles.formTitle}>Add New Location</h3>
                        
                        <div style={styles.formGroup}>
                            <label>Location Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={newLocation.name}
                                onChange={this.handleInputChange}
                                required
                                style={styles.input}
                                placeholder="e.g., Building A, Central Park, Main Entrance"
                            />
                        </div>
                        
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label>Latitude *</label>
                                <input
                                    type="number"
                                    name="lat"
                                    value={newLocation.lat}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    required
                                    style={styles.input}
                                    placeholder="e.g., 34.056945"
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label>Longitude *</label>
                                <input
                                    type="number"
                                    name="lng"
                                    value={newLocation.lng}
                                    onChange={this.handleInputChange}
                                    step="any"
                                    required
                                    style={styles.input}
                                    placeholder="e.g., -117.820719"
                                />
                            </div>
                        </div>
                        
                        <div style={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="isPublic"
                                    checked={newLocation.isPublic}
                                    onChange={(e) => this.setState(prevState => ({
                                        newLocation: {
                                            ...prevState.newLocation,
                                            isPublic: e.target.checked
                                        }
                                    }))}
                                />
                                Make this location public (visible to everyone)
                            </label>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={addingLocation}
                            style={styles.submitButton}
                        >
                            {addingLocation ? 'Adding...' : 'Add Location'}
                        </button>
                    </form>
                )}
                
                {/* Login Prompt for Adding Locations */}
                {!isLoggedIn && (
                    <div style={styles.loginPrompt}>
                        <p>🔒 <strong>Want to add locations?</strong> Please login to add and save locations for distance calculation.</p>
                    </div>
                )}
                
                {/* Distance Calculator Form - Available to everyone */}
                <form onSubmit={this.handleDistanceCalculation} style={styles.calculatorForm}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label>Origin Location *</label>
                            <select
                                value={originId}
                                onChange={(e) => this.setState({ originId: e.target.value })}
                                required
                                style={styles.select}
                            >
                                <option value="">Select origin...</option>
                                {locations.map(loc => (
                                    <option key={loc._id} value={loc._id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label>Destination Location *</label>
                            <select
                                value={destinationId}
                                onChange={(e) => this.setState({ destinationId: e.target.value })}
                                required
                                style={styles.select}
                            >
                                <option value="">Select destination...</option>
                                {locations.map(loc => (
                                    <option key={loc._id} value={loc._id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || locations.length < 2}
                        style={styles.calculateButton}
                    >
                        {loading ? 'Calculating...' : 'Calculate Distance'}
                    </button>
                    
                    {locations.length < 2 && (
                        <p style={styles.hint}>
                            {locations.length === 0 
                                ? "Add at least 2 locations to calculate distances" 
                                : "Add one more location to calculate distances"}
                        </p>
                    )}
                </form>
                
                {/* Error Display */}
                {error && <div style={styles.error}>{error}</div>}
                
                {/* Results Display */}
                {result && (
                    <div style={styles.resultContainer}>
                        <h3 style={styles.resultTitle}>📏 Distance Results</h3>
                        
                        <div style={styles.routeInfo}>
                            <div style={styles.routePoint}>
                                <span style={styles.routeIcon}>📍</span>
                                <div>
                                    <strong>From:</strong> {result.origin.name}
                                    <br />
                                    <small style={styles.coordinates}>
                                        {result.origin.coordinates.lat}, {result.origin.coordinates.lng}
                                    </small>
                                </div>
                            </div>
                            <div style={styles.routeArrow}>↓</div>
                            <div style={styles.routePoint}>
                                <span style={styles.routeIcon}>📍</span>
                                <div>
                                    <strong>To:</strong> {result.destination.name}
                                    <br />
                                    <small style={styles.coordinates}>
                                        {result.destination.coordinates.lat}, {result.destination.coordinates.lng}
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <div style={styles.distanceGrid}>
                            <div style={styles.distanceCard}>
                                <span style={styles.distanceIcon}>🎯</span>
                                <div>
                                    <div style={styles.distanceValue}>{result.distance.miles} miles</div>
                                    <div style={styles.distanceLabel}>Straight-line Distance</div>
                                </div>
                            </div>
                            
                            <div style={styles.distanceCard}>
                                <span style={styles.distanceIcon}>🚶</span>
                                <div>
                                    <div style={styles.distanceValue}>{result.distance.stepsFormatted} steps</div>
                                    <div style={styles.distanceLabel}>Walking Steps (30" intervals)</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style={styles.conversionInfo}>
                            <p>✨ {result.distance.miles} miles = {result.distance.stepsFormatted} steps</p>
                            <p style={styles.conversionDetail}>
                                (Based on average step length of 30 inches: 1 mile = 2,112 steps)
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Locations List - Public to everyone */}
                {locations.length > 0 && (
                    <div style={styles.locationsList}>
                        <h3>Saved Locations ({locations.length})</h3>
                        <div style={styles.locationGrid}>
                            {locations.map(loc => (
                                <div key={loc._id} style={styles.locationCard}>
                                    <div style={styles.locationHeader}>
                                        <strong>{loc.name}</strong>
                                        {!loc.isPublic && (
                                            <span style={styles.privateBadge}>Private</span>
                                        )}
                                    </div>
                                    <p style={styles.coordinatesDisplay}>
                                        📍 {loc.coordinates.lat}, {loc.coordinates.lng}
                                    </p>
                                    <small style={styles.locationMeta}>
                                        Added by: {loc.createdByUsername || 'Unknown'}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

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
    checkboxGroup: {
        marginBottom: '15px'
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#008550',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    loginPrompt: {
        backgroundColor: '#fff9e6',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        borderLeft: `4px solid #ffc036`
    },
    calculatorForm: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        marginBottom: '20px'
    },
    calculateButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#ffc036',
        color: '#0c0c0c',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    hint: {
        textAlign: 'center',
        fontSize: '12px',
        color: '#999',
        marginTop: '10px'
    },
    resultContainer: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
    },
    resultTitle: {
        marginTop: 0,
        marginBottom: '20px',
        color: '#0c0c0c'
    },
    routeInfo: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px'
    },
    routePoint: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px'
    },
    routeIcon: {
        fontSize: '20px'
    },
    routeArrow: {
        textAlign: 'center',
        fontSize: '20px',
        color: '#008550'
    },
    coordinates: {
        color: '#666',
        fontFamily: 'monospace',
        fontSize: '11px'
    },
    distanceGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
    },
    distanceCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
    },
    distanceIcon: {
        fontSize: '32px'
    },
    distanceValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#008550'
    },
    distanceLabel: {
        fontSize: '12px',
        color: '#666'
    },
    distanceSubLabel: {
        fontSize: '10px',
        color: '#999',
        marginTop: '2px'
    },
    conversionInfo: {
        textAlign: 'center',
        padding: '15px',
        backgroundColor: '#fff9e6',
        borderRadius: '8px',
        borderLeft: `4px solid #ffc036`
    },
    conversionDetail: {
        fontSize: '12px',
        color: '#666',
        marginTop: '5px'
    },
    locationsList: {
        marginTop: '30px'
    },
    locationGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '15px',
        marginTop: '15px'
    },
    locationCard: {
        backgroundColor: '#f9f9f9',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
    },
    locationHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    privateBadge: {
        backgroundColor: '#ffc036',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#0c0c0c'
    },
    coordinatesDisplay: {
        fontSize: '12px',
        color: '#666',
        fontFamily: 'monospace',
        marginBottom: '8px'
    },
    locationMeta: {
        fontSize: '10px',
        color: '#999'
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px'
    }
};

export default DistanceCalculator;