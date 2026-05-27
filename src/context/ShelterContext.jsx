import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { message } from 'antd';
import { createShelter, getShelters, updateShelter as updateShelterApi, deleteShelter as deleteShelterApi } from '../services/shelterService';
import { useAuth } from './AuthContext';

const ShelterContext = createContext(null);

export const ShelterProvider = ({ children }) => {
    const [shelters, setShelters] = useState([]);
    const [totalShelters, setTotalShelters] = useState(0);
    const [loading, setLoading] = useState(false);
    const hasShownError = useRef(false);
    const { user } = useAuth() || {};

    const fetchShelters = async (params = {}) => {
        if (!user) return; // Skip API calls when logged out
        setLoading(true);
        try {
            const data = await getShelters(params);
            // Handle both { items: [] } and [] formats
            const items = data?.items ?? (Array.isArray(data) ? data : []);
            // Sort items by ID descending to show newest first
            const sortedItems = [...items].sort((a, b) => b.id - a.id);
            setShelters(sortedItems);
            setTotalShelters(data?.total ?? sortedItems.length);
            
            if (!Array.isArray(items)) {
                console.warn('Shelters API did not return an array:', data);
            }
        } catch (error) {
            console.error('Error fetching shelters:', error);
            if (!hasShownError.current) {
                message.error('Failed to load shelters from backend');
                hasShownError.current = true;
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShelters();
        const intervalId = setInterval(() => fetchShelters(), 10000);
        return () => clearInterval(intervalId);
    }, [user]);

    const addShelter = async (newShelter) => {
        setLoading(true);
        try {
            await createShelter(newShelter);
            message.success("Shelter created successfully");
            await fetchShelters(); // refresh table
            return true;
        } catch (error) {
            console.error('Error creating shelter:', error);
            const errorData = error.response?.data;
            let errorMsg = 'Failed to create shelter';
            
            if (errorData?.message) {
                errorMsg = errorData.message;
            } else if (errorData?.errors) {
                // Handle ASP.NET Core validation errors object
                const firstError = Object.values(errorData.errors)[0];
                if (Array.isArray(firstError)) errorMsg = firstError[0];
            } else if (typeof errorData === 'string') {
                errorMsg = errorData;
            }
            
            message.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateShelterStatus = async (id, newStatus) => {
        try {
            const shelterToUpdate = shelters.find(s => s.id === id);
            if (!shelterToUpdate) return;
            await updateShelterApi(id, { ...shelterToUpdate, status: newStatus });
            setShelters(prev => prev.map(shelter => shelter.id === id ? { ...shelter, status: newStatus } : shelter));
        } catch (error) {
            console.error('Failed to update shelter status:', error);
            message.error(error.response?.data?.message || JSON.stringify(error.response?.data) || 'Failed to update shelter status');
            fetchShelters(); // Re-fetch to ensure local state is correct
        }
    };

    const updateShelter = async (id, updatedData) => {
        try {
            await updateShelterApi(id, updatedData);
            setShelters(prev => prev.map(shelter => shelter.id === id ? { ...shelter, ...updatedData } : shelter));
            return true;
        } catch (error) {
            console.error('Failed to update shelter:', error);
            message.error(error.response?.data?.message || 'Failed to update shelter');
            return false;
        }
    };

    const deleteShelter = async (id) => {
        try {
            await deleteShelterApi(id);
            setShelters(prev => prev.filter(shelter => shelter.id !== id));
            return true;
        } catch (error) {
            console.error('Failed to delete shelter:', error);
            message.error('Failed to delete shelter');
            return false;
        }
    };

    return (
        <ShelterContext.Provider value={{ shelters, totalShelters, loading, fetchShelters, addShelter, updateShelterStatus, updateShelter, deleteShelter }}>
            {children}
        </ShelterContext.Provider>
    );
};

export const useShelter = () => useContext(ShelterContext);
