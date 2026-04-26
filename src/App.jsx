import React, { Component } from 'react';
import axios from './axiosConfig';
import Navigation from './components/Navigation';
import FoodCatalog from './components/FoodCatalog';
import DistanceCalculator from './components/DistanceCalculator';
import Footer from './components/Footer';
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
            const response = await axios.get('/api/users/me');
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
            await axios.post('/api/users/logout');
            this.setState({ user: null });
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
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
            <div className="App" style={styles.app}>
                <Navigation 
                    currentPage={currentPage}
                    onPageChange={this.handlePageChange}
                    user={user}
                    onLoginSuccess={this.handleLoginSuccess}
                    onLogout={this.handleLogout}
                />
                
                <div style={styles.mainContent}>
                    {currentPage === 'catalog' ? (
                        <FoodCatalog 
                            user={user}
                            onLoginSuccess={this.handleLoginSuccess}
                        />
                    ) : (
                        <DistanceCalculator user={user} />
                    )}
                </div>
                
                <Footer />
            </div>
        );
    }
}

const styles = {
    app: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
    },
    mainContent: {
        flex: 1
    },
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