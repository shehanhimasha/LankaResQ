import React, { createContext, useState, useContext } from 'react';
import { message } from 'antd';
import { createShelter, getShelters } from '../services/shelterService';

const ShelterContext = createContext(null);

export const ShelterProvider = ({ children }) => {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchShelters = async () => {
        setLoading(true);
        try {
            const data = await getShelters();
            setShelters(data.items || []);
        } catch (error) {
            console.error('Error fetching shelters:', error);
            message.error('Failed to load shelters');
        } finally {
            setLoading(false);
        }
    };

    const addShelter = async (newShelter) => {
        setLoading(true);
        try {
            await createShelter(newShelter);
            message.success("Shelter created successfully");
            await fetchShelters(); // refresh table
            return true;
        } catch (error) {
            console.error('Error creating shelter:', error);
            message.error(error.response?.data?.message || 'Failed to create shelter');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateShelterStatus = (id, newStatus) => {
        setShelters(shelters.map(shelter => shelter.id === id ? { ...shelter, status: newStatus } : shelter));
    };

    const updateShelter = (id, updatedData) => {
        setShelters(shelters.map(shelter => shelter.id === id ? { ...shelter, ...updatedData } : shelter));
    };

    const deleteShelter = (id) => {
        setShelters(shelters.filter(shelter => shelter.id !== id));
    };

    return (
        <ShelterContext.Provider value={{ shelters, loading, fetchShelters, addShelter, updateShelterStatus, updateShelter, deleteShelter }}>
            {children}
        </ShelterContext.Provider>
    );
};

export const useShelter = () => useContext(ShelterContext);
