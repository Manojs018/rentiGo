import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('rentigo_user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('rentigo_token') || null,
  loading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token, error: null };
    case 'LOGIN_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, error: null, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('rentigo_token', state.token);
      localStorage.setItem('rentigo_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('rentigo_token');
      localStorage.removeItem('rentigo_user');
    }
  }, [state.token, state.user]);

  // Refresh user profile details on load to sync ecoPoints/stats
  useEffect(() => {
    const syncUser = async () => {
      if (state.token) {
        try {
          const { data } = await authAPI.getMe();
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: state.token } });
        } catch (err) {
          if (err.response?.status === 401) {
            dispatch({ type: 'LOGOUT' });
          }
        }
      }
    };
    syncUser();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { data } = await authAPI.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAIL', payload: msg });
      throw new Error(msg);
    }
  };

  const googleLogin = async (idToken, role) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { data } = await authAPI.googleLogin(idToken, role);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      dispatch({ type: 'LOGIN_FAIL', payload: msg });
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { data } = await authAPI.register(userData);
      if (data.token && data.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAIL', payload: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    localStorage.setItem('rentigo_user', JSON.stringify({ ...state.user, ...userData }));
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      googleLogin,
      register,
      logout,
      updateUser,
      clearError,
      isAuthenticated: !!state.token,
      isCustomer: state.user?.role === 'customer',
      isOwner: state.user?.role === 'owner',
      isAdmin: state.user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
