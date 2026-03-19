import React, { Component } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';
const API_URL = `${API_BASE_URL}/api`;

class ItemManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [], // Initialize as empty array
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
      error: null
    };
  }

  componentDidMount() {
    this.fetchItems();
  }

  fetchItems = async () => {
    this.setState({ loading: true, error: null });
    try {
      console.log('Fetching from:', `${API_URL}/items`); // Debug log
      
      const response = await axios.get(`${API_URL}/items`, {
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Full response:', response); // Debug log
      console.log('Response data:', response.data); // Debug log
      
      // Ensure we always have an array
      const items = Array.isArray(response.data) ? response.data : [];
      this.setState({ items, loading: false });
    } catch (error) {
      console.error('Full error object:', error); // Debug log
      
      let errorMessage = 'Failed to fetch items: ';
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout - backend might be slow';
      } else if (error.message.includes('Network Error')) {
        errorMessage += 'Cannot connect to backend. Make sure it\'s running on port 5000';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }
      
      this.setState({ 
        error: errorMessage, 
        loading: false,
        items: []
      });
    }
  };

  createItem = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/items`, this.state.currentItem);
      this.setState(prevState => ({
        items: [...prevState.items, response.data],
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
        loading: false
      }));
    } catch (error) {
      this.setState({ 
        error: 'Failed to create item: ' + error.message, 
        loading: false 
      });
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fcpAmount fields
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
      // Handle top-level fields
      this.setState(prevState => ({
        currentItem: {
          ...prevState.currentItem,
          [name]: name === 'name' ? value : (parseFloat(value) || 0)
        }
      }));
    }
  };

  render() {
    const { items, currentItem, loading, error } = this.state;

    // Debug logging
    console.log('Rendering with items:', items);
    console.log('Items is array:', Array.isArray(items));

    return (
      <div style={styles.container}>
        <h1>🍎 Nutrition Facts Manager</h1>
        
        {/* Error Display */}
        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div style={styles.loading}>
            Loading...
          </div>
        )}

        {/* Form for Creating Items */}
        <form onSubmit={this.createItem} style={styles.form}>
          <h2>Add New Food Item</h2>
          
          <div style={styles.formGroup}>
            <label>Food Name:</label>
            <input
              type="text"
              name="name"
              value={currentItem.name}
              onChange={this.handleInputChange}
              required
              style={styles.input}
              placeholder="e.g., Apple"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Calories:</label>
            <input
              type="number"
              name="calories"
              value={currentItem.calories}
              onChange={this.handleInputChange}
              min="0"
              step="1"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Quantity (grams):</label>
            <input
              type="number"
              name="quantity"
              value={currentItem.quantity}
              onChange={this.handleInputChange}
              min="0"
              step="1"
              required
              style={styles.input}
            />
          </div>

          <h3>Macronutrients (per 100g)</h3>
          
          <div style={styles.formGroup}>
            <label>Fat (g):</label>
            <input
              type="number"
              name="fcpAmount.fat"
              value={currentItem.fcpAmount.fat}
              onChange={this.handleInputChange}
              min="0"
              step="0.1"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Carbs (g):</label>
            <input
              type="number"
              name="fcpAmount.carbs"
              value={currentItem.fcpAmount.carbs}
              onChange={this.handleInputChange}
              min="0"
              step="0.1"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Protein (g):</label>
            <input
              type="number"
              name="fcpAmount.protein"
              value={currentItem.fcpAmount.protein}
              onChange={this.handleInputChange}
              min="0"
              step="0.1"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Adding...' : 'Add Food Item'}
          </button>
        </form>

        {/* Items List Display - Safely render items */}
        <div style={styles.itemsList}>
          <h2>Food Items in Database</h2>
          
          {/* Check if items exists and is an array before mapping */}
          {!items ? (
            <p>Loading items...</p>
          ) : !Array.isArray(items) ? (
            <p style={styles.error}>Error: Items data is not in the correct format</p>
          ) : items.length === 0 ? (
            <p>No food items found. Add your first item above!</p>
          ) : (
            <div style={styles.grid}>
              {items.map(item => (
                <div key={item._id} style={styles.card}>
                  <h3 style={styles.cardTitle}>{item.name}</h3>
                  <div style={styles.cardContent}>
                    <p><strong>Calories:</strong> {item.calories}</p>
                    <p><strong>Quantity:</strong> {item.quantity}g</p>
                    
                    {item.fcpAmount && (
                      <div>
                        <p><strong>Macros per 100g:</strong></p>
                        <ul style={styles.macroList}>
                          <li>Fat: {item.fcpAmount.fat || 0}g</li>
                          <li>Carbs: {item.fcpAmount.carbs || 0}g</li>
                          <li>Protein: {item.fcpAmount.protein || 0}g</li>
                        </ul>
                      </div>
                    )}
                    
                    <p style={styles.date}>
                      Added: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

// Styles object for better organization
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  itemsList: {
    marginTop: '30px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    marginTop: 0,
    color: '#333',
    borderBottom: '2px solid #4CAF50',
    paddingBottom: '10px'
  },
  cardContent: {
    color: '#666'
  },
  macroList: {
    listStyle: 'none',
    padding: 0,
    margin: '10px 0'
  },
  date: {
    fontSize: '12px',
    color: '#999',
    marginTop: '10px'
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
    marginBottom: '20px'
  }
};

export default ItemManager;