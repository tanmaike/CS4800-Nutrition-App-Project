import React, { Component } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation';
import FoodCatalog from './components/FoodCatalog';
import ItemManager from './components/ItemManager';
import DistanceCalculator from './components/DistanceCalculator';
import API_URL from './config';

axios.defaults.withCredentials = true;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 'catalog',
            user: null,
            loading: true
        };
    }

    componentDidMount() {
        this.checkAuthStatus();
    }

    checkAuthStatus = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/me`);
            if (response.data.isAuthenticated) {
                this.setState({ user: response.data.user, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.setState({ loading: false });
        }
    };

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    handleLoginSuccess = (user) => {
        this.setState({ user });
    };

    handleLogout = async () => {
        try {
            await axios.post(`${API_URL}/users/logout`);
            this.setState({ user: null });
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    handleItemAdded = () => {
        // Refresh catalog when new item is added
        if (this.state.currentPage === 'catalog') {
            this.setState({ currentPage: 'add' }, () => {
                setTimeout(() => {
                    this.setState({ currentPage: 'catalog' });
                }, 100);
            });
        }
    };

    render() {
        const { currentPage, user, loading } = this.state;

        if (loading) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}>Loading...</div>
                </div>
            );
        }

        return (
            <div className="App">
                <Navigation 
                    currentPage={currentPage}
                    onPageChange={this.handlePageChange}
                    user={user}
                    onLoginSuccess={this.handleLoginSuccess}
                    onLogout={this.handleLogout}
                />
                
                {currentPage === 'catalog' ? (
                    <FoodCatalog key={currentPage} />
                ) : currentPage === 'add' ? (
                    <ItemManager 
                        user={user}
                        onLoginSuccess={this.handleLoginSuccess}
                        onItemAdded={this.handleItemAdded}
                    />
                ) : (
                    <DistanceCalculator user={user} />
                )}
            </div>
        );
    }
}

const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
    },
    loadingSpinner: {
        fontSize: '18px',
        color: '#666'
    }
};

export default App;