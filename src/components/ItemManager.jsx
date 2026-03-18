import React, { Component } from 'react';
import axios from 'axios';

// API base URL - adjust based on your backend
const API_URL = 'http://localhost:5173/api';

class ItemManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      currentItem: {
        name: '',
        quantity: 0,
        price: 0.00,
        isAvailable: true,
        tags: [],
        ratings: [],
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: 'cm'
        },
        metadata: {}
      },
      loading: false,
      error: null,
      newTag: '',
      newRating: '',
      editingId: null
    };
  }

  // Component Lifecycle - Fetch data on mount
  componentDidMount() {
    this.fetchItems();
  }

  // API Methods
  fetchItems = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/items`);
      this.setState({ items: response.data, loading: false });
    } catch (error) {
      this.setState({ 
        error: 'Failed to fetch items: ' + error.message, 
        loading: false 
      });
    }
  };

  render() {
    const { items, currentItem, loading, error, newTag, newRating, editingId } = this.state;

    return (
      <div className="item-manager">
        <h1>Item Manager - Multiple Datatypes Demo</h1>
        
        {/* Error Display */}
        {error && <div className="error">{error}</div>}
        
        {/* Loading Indicator */}
        {loading && <div className="loading">Loading...</div>}

        {/* Form for Creating/Editing Items */}
        <form onSubmit={this.handleSubmit} className="item-form">
          <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
          
          {/* String Input */}
          <div className="form-group">
            <label>Name (String):</label>
            <input
              type="text"
              name="name"
              value={currentItem.name}
              onChange={this.handleInputChange}
              required
            />
          </div>

          {/* Number Input - Integer */}
          <div className="form-group">
            <label>Quantity (Number - Integer):</label>
            <input
              type="number"
              name="quantity"
              value={currentItem.quantity}
              onChange={this.handleInputChange}
              min="0"
              step="1"
              required
            />
          </div>

          {/* Number Input - Float/Decimal */}
          <div className="form-group">
            <label>Price (Number - Decimal):</label>
            <input
              type="number"
              name="price"
              value={currentItem.price}
              onChange={this.handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Boolean Input */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={currentItem.isAvailable}
                onChange={this.handleInputChange}
              />
              Is Available? (Boolean)
            </label>
          </div>

          {/* Array of Strings - Tags */}
          <div className="form-group">
            <label>Tags (Array of Strings):</label>
            <div className="array-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => this.setState({ newTag: e.target.value })}
                placeholder="Enter a tag"
              />
              <button type="button" onClick={this.addTag}>Add Tag</button>
            </div>
            <div className="tags-list">
              {currentItem.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button type="button" onClick={() => this.removeTag(index)}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Array of Numbers - Ratings */}
          <div className="form-group">
            <label>Ratings (Array of Numbers 1-5):</label>
            <div className="array-input">
              <input
                type="number"
                value={newRating}
                onChange={(e) => this.setState({ newRating: e.target.value })}
                min="1"
                max="5"
                step="0.5"
                placeholder="Rating 1-5"
              />
              <button type="button" onClick={this.addRating}>Add Rating</button>
            </div>
            <div className="ratings-list">
              {currentItem.ratings.map((rating, index) => (
                <span key={index} className="rating">
                  {rating} ★
                  <button type="button" onClick={() => this.removeRating(index)}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Nested Object - Dimensions */}
          <div className="form-group nested">
            <label>Dimensions (Nested Object):</label>
            <div className="nested-fields">
              <input
                type="number"
                name="length"
                placeholder="Length"
                value={currentItem.dimensions.length}
                onChange={this.handleDimensionChange}
                step="0.1"
              />
              <input
                type="number"
                name="width"
                placeholder="Width"
                value={currentItem.dimensions.width}
                onChange={this.handleDimensionChange}
                step="0.1"
              />
              <input
                type="number"
                name="height"
                placeholder="Height"
                value={currentItem.dimensions.height}
                onChange={this.handleDimensionChange}
                step="0.1"
              />
              <select
                name="unit"
                value={currentItem.dimensions.unit}
                onChange={this.handleDimensionChange}
              >
                <option value="cm">cm</option>
                <option value="m">m</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId ? 'Update Item' : 'Create Item'}
            </button>
            {editingId && (
              <button type="button" onClick={this.cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Items List Display */}
        <div className="items-list">
          <h2>Items from Database</h2>
          {items.length === 0 ? (
            <p>No items found. Add your first item!</p>
          ) : (
            items.map(item => (
              <div key={item._id} className="item-card">
                <h3>{item.name}</h3>
                <div className="item-details">
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                  <p><strong>Available:</strong> {item.isAvailable ? '✓' : '✗'}</p>
                  
                  {/* Display Tags Array */}
                  {item.tags && item.tags.length > 0 && (
                    <p><strong>Tags:</strong> {item.tags.join(', ')}</p>
                  )}
                  
                  {/* Display Ratings Array */}
                  {item.ratings && item.ratings.length > 0 && (
                    <div>
                      <strong>Ratings:</strong>
                      <div className="ratings-display">
                        {item.ratings.map((rating, i) => (
                          <span key={i} className="rating-star">{rating}★</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Display Dimensions Object */}
                  {item.dimensions && (
                    <p>
                      <strong>Dimensions:</strong> {item.dimensions.length} × {item.dimensions.width} × {item.dimensions.height} {item.dimensions.unit}
                    </p>
                  )}
                  
                  {/* Display Date */}
                  <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                  
                  {/* Action Buttons */}
                  <div className="item-actions">
                    <button onClick={() => this.editItem(item)}>Edit</button>
                    <button onClick={() => this.deleteItem(item._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}

export default ItemManager;