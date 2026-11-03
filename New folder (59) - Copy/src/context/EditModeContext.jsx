import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const EditModeContext = createContext(null);

// Roles that have direct edit access (others only get request access)
const EDIT_MODE_ROLES = ['admin', 'chairman'];

export const EditModeProvider = ({ children }) => {
  const { profile } = useAuth();
  const isAdmin = EDIT_MODE_ROLES.includes(profile?.role);

  // Start as false
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  useEffect(() => {
    if (profile?.role) {
      try {
        const stored = JSON.parse(localStorage.getItem('adminEditMode') || 'false');
        setEditModeEnabled(!!stored);
      } catch {
        setEditModeEnabled(false);
      }
    }
  }, [profile?.uid, profile?.role]);

  const toggleEditMode = (val) => {
    const next = val !== undefined ? Boolean(val) : !editModeEnabled;
    setEditModeEnabled(next);
    localStorage.setItem('adminEditMode', JSON.stringify(next));
  };

  return (
    <EditModeContext.Provider value={{ editModeEnabled, toggleEditMode, isAdmin }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useAuthEditMode = () => useContext(EditModeContext);
export const useEditMode = () => useContext(EditModeContext);
