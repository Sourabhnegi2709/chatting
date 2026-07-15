import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginAPI, logout as logoutAPI, me as meAPI, signup as signupAPI, updateProfile as updateProfileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                // Prefer cookie-auth
                const { data } = await meAPI();
                if (data?.user) {
                    setUser(data.user);
                    localStorage.setItem('chat-user', JSON.stringify(data.user));
                    return;
                }
            } catch (e) {
                // Fallback: localStorage
                const savedUser = localStorage.getItem('chat-user');
                if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch {
                        localStorage.removeItem('chat-user');
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);


    const login = async (email, password) => {
        try {
            setLoading(true);
            const { data } = await loginAPI({ email, password });
            const nextUser = data.user;
            localStorage.setItem('chat-user', JSON.stringify(nextUser));
            setUser(nextUser);
            return nextUser;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        try {
            setLoading(true);
            const { data } = await signupAPI({ name, email, password });
            const nextUser = data.user;
            localStorage.setItem('chat-user', JSON.stringify(nextUser));
            setUser(nextUser);
            return nextUser;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('chat-user');
            setUser(null);
        }
    };

    const updateUserProfile = async (profileData) => {
        try {
            setLoading(true);
            const { data } = await updateProfileAPI(profileData);
            const nextUser = data.user;
            localStorage.setItem('chat-user', JSON.stringify(nextUser));
            setUser(nextUser);
            return nextUser;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Profile update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                signup,
                logout,
                updateUserProfile,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};