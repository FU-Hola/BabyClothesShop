import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_UNAUTHORIZED_EVENT } from '../../../shared/api/axiosClient';
import authApi from '../api/authApi';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadCurrentUser = useCallback(async () => {
        try {
            const currentUser = await authApi.getMe();
            setUser(currentUser);
            return currentUser;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        authApi.getMe()
            .then((currentUser) => {
                if (active) setUser(currentUser);
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        const clearUser = () => setUser(null);
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearUser);
        return () => {
            active = false;
            window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearUser);
        };
    }, []);

    const login = useCallback(async (credentials) => {
        const authenticatedUser = await authApi.login(credentials);
        setUser(authenticatedUser);
        return authenticatedUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        refreshUser: loadCurrentUser,
    }), [user, loading, login, logout, loadCurrentUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
