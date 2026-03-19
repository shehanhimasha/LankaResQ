import React, { createContext, useState, useContext } from 'react';

const RequestContext = createContext(null);

export const RequestProvider = ({ children }) => {
    // Initial Form Schema
    const [formSchema, setFormSchema] = useState([
        {
            id: 'emergencyType',
            type: 'checkbox-group',
            label: 'Type of Emergency',
            options: [
                { label: 'Rescue', value: 'rescue', icon: 'SafetyCertificateOutlined' },
                { label: 'Food', value: 'food', icon: 'CoffeeOutlined' }, // Using available icons or just text for now
                { label: 'Shelter', value: 'shelter', icon: 'HomeOutlined' },
                { label: 'Medical', value: 'medical', icon: 'MedicineBoxOutlined' },
            ],
            required: true,
            fixed: true, // Cannot be deleted
        },
        {
            id: 'urgencyLevel',
            type: 'select',
            label: 'Urgency Level',
            options: [
                { label: 'Low', value: 'low', color: 'green' },
                { label: 'Medium', value: 'medium', color: 'orange' },
                { label: 'High', value: 'high', color: 'red' },
            ],
            required: true,
            fixed: true,
        },
        {
            id: 'numberOfPeople',
            type: 'number',
            label: 'Number of People',
            required: true,
            fixed: true,
        },
        {
            id: 'moreDetails',
            type: 'textarea',
            label: 'More Details',
            required: false,
            fixed: true,
        },
        {
            id: 'contactNumber',
            type: 'tel',
            label: 'Contact Number',
            required: true,
            fixed: true,
        },
        {
            id: 'location',
            type: 'location', // Custom type for "type or get device location"
            label: 'Location',
            required: true,
            fixed: true,
        },
    ]);

    // Mock Help Requests
    const [requests, setRequests] = useState([
        {
            id: 100001,
            name: 'Kamal Perera',
            reminder: 2,
            emergencyType: ['rescue', 'medical'],
            urgencyLevel: 'high',
            numberOfPeople: 4,
            moreDetails: 'Trapped due to flood water rising.',
            contactNumber: '0771234567',
            location: 'Colombo 10', // Colombo approx
            status: 'pending',
            timestamp: new Date().toISOString(),
        },
        {
            id: 100002,
            name: 'Nimali Silva',
            reminder: 0,
            emergencyType: ['food'],
            urgencyLevel: 'medium',
            numberOfPeople: 10,
            moreDetails: 'Need dry rations for 3 families.',
            contactNumber: '0719876543',
            location: 'Galle',
            status: 'pending',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
        {
            id: 100003,
            name: 'Ruwan Kumara',
            reminder: 5,
            emergencyType: ['shelter'],
            urgencyLevel: 'low',
            numberOfPeople: 2,
            moreDetails: 'Roof damaged.',
            contactNumber: '0755555555',
            location: 'Kandy',
            status: 'pending',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
            id: 100004,
            name: 'Priyanka Dias',
            reminder: 0,
            emergencyType: ['food'],
            urgencyLevel: 'medium',
            numberOfPeople: 12,
            moreDetails: 'Need dry rations for 2 families.',
            contactNumber: '0757775555',
            location: 'Beruwala',
            status: 'pending',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
    ]);

    const updateSchema = (newSchema) => {
        setFormSchema(newSchema);
    };

    const updateRequestStatus = (id, newStatus) => {
        setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    };

    const updateRequest = (updatedRequest) => {
        setRequests(requests.map(req => req.id === updatedRequest.id ? updatedRequest : req));
    };

    const addRequest = (newRequest) => {
        const nextId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
        setRequests([...requests, { ...newRequest, id: nextId, status: 'pending', timestamp: new Date().toISOString() }]);
    }

    const deleteRequest = (id) => {
        setRequests(requests.filter(req => req.id !== id));
    };

    return (
        <RequestContext.Provider value={{ formSchema, updateSchema, requests, updateRequestStatus, updateRequest, addRequest, deleteRequest }}>
            {children}
        </RequestContext.Provider>
    );
};

export const useRequest = () => useContext(RequestContext);
