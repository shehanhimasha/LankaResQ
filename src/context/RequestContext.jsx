import React, { createContext, useState, useContext, useEffect } from 'react';
import helpRequestService from '../services/helpRequestService';

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
                { label: 'Food', value: 'food', icon: 'CoffeeOutlined' },
                { label: 'Shelter', value: 'shelter', icon: 'HomeOutlined' },
                { label: 'Medical', value: 'medical', icon: 'MedicineBoxOutlined' },
            ],
            required: true,
            fixed: true,
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
            type: 'location',
            label: 'Location',
            required: true,
            fixed: true,
        },
    ]);

    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            const data = await helpRequestService.getAllHelpRequests({ Page: 1, PageSize: 100 });
            if (data && data.items) {
                const mapped = data.items.map(item => ({
                    id: item.id,
                    name: item.name || 'Unknown',
                    location: item.location || 'Unknown',
                    reminder: item.remindedCount || 0,
                    emergencyType: item.emergencyType?.description ? [item.emergencyType.description.toLowerCase()] : [],
                    urgencyLevel: item.ugrencyLevel?.name?.toLowerCase() || item.urgencyLevel?.name?.toLowerCase() || 'medium',
                    numberOfPeople: item.noOfPeople || 1,
                    moreDetails: item.description || item.note || '',
                    contactNumber: item.helpRequestId || 'N/A', // Using helpRequestId as fallback if the backend doesn't provide contact in GET
                    status: item.activeStatus?.name?.toLowerCase() || item.approvalStage?.name?.toLowerCase() || 'pending',
                    timestamp: item.createdOn || new Date().toISOString()
                }));
                setRequests(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch help requests', error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateSchema = (newSchema) => {
        setFormSchema(newSchema);
    };

    const updateRequestStatus = (id, newStatus) => {
        setRequests(requests => requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    };

    const updateRequest = (updatedRequest) => {
        setRequests(requests => requests.map(req => req.id === updatedRequest.id ? updatedRequest : req));
    };

    const addRequest = async (newRequest) => {
        try {
            // Mapping frontend model to POST schema
            const payload = {
                name: newRequest.name,
                location: newRequest.location,
                description: newRequest.moreDetails,
                noOfPeople: newRequest.numberOfPeople ? parseInt(newRequest.numberOfPeople) : 1,
                emergencyTypeId: 1, // Fallback if not specified in UI appropriately
                ugrencyLevelId: newRequest.urgencyLevel === 'high' ? 3 : newRequest.urgencyLevel === 'medium' ? 2 : 1,
                latitude: 0,
                longitude: 0
            };
            await helpRequestService.createHelpRequest(payload);
            fetchRequests(); // Reload list after successful creation
        } catch (error) {
            console.error('Failed to add request to backend, falling back to local state', error);
            const nextId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
            setRequests(prev => [...prev, { ...newRequest, id: nextId, status: 'pending', timestamp: new Date().toISOString() }]);
        }
    };

    const deleteRequest = (id) => {
        setRequests(requests => requests.filter(req => req.id !== id));
    };

    return (
        <RequestContext.Provider value={{ formSchema, updateSchema, requests, updateRequestStatus, updateRequest, addRequest, deleteRequest }}>
            {children}
        </RequestContext.Provider>
    );
};

export const useRequest = () => useContext(RequestContext);
