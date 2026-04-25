import React, { createContext, useState, useContext } from 'react';

const ShelterContext = createContext(null);

export const ShelterProvider = ({ children }) => {
    // Mock Shelters Data
    const [shelters, setShelters] = useState([
        {
            id: 1,
            name: 'City Community Center',
            location: 'Colombo 07',
            contactNumber: '0112345678',
            maxCapacity: 150,
            status: 'Available',
        },
        {
            id: 2,
            name: 'Galle Face School Hall',
            location: 'Galle Face',
            contactNumber: '0119876543',
            maxCapacity: 300,
            status: 'Full',
        },
        {
            id: 3,
            name: 'Temple of the Tooth Shelter',
            location: 'Kandy',
            contactNumber: '0812223334',
            maxCapacity: 50,
            status: 'Not Available',
        },
    ]);

    const addShelter = (newShelter) => {
        const shelter = {
            ...newShelter,
            id: shelters.length + 1,
            // Status defaults to 'Available' if not provided, though form should provide it
        };
        setShelters([...shelters, shelter]);
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
        <ShelterContext.Provider value={{ shelters, addShelter, updateShelterStatus, updateShelter, deleteShelter }}>
            {children}
        </ShelterContext.Provider>
    );
};

export const useShelter = () => useContext(ShelterContext);
