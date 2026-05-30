import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { notification } from 'antd';
import helpRequestService from '../services/helpRequestService';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth() || {};
    const requestsRef = useRef(requests);

    useEffect(() => {
        requestsRef.current = requests;
    }, [requests]);

    const fetchRequests = async () => {
        if (!user) return; // Skip API polling when logged out
        try {
            const data = await helpRequestService.getAllHelpRequests({ Page: 1, PageSize: 100 });
            if (data && data.items) {
                const mapped = data.items.map(item => ({
                    id: item.id,
                    name: item.name || 'Unknown',
                    location: item.location || 'Unknown',
                    reminder: item.remindedCount || 0,
                    emergencyType: (() => {
                        const id = item.emergencyType?.id || item.emergencyTypeId;
                        if (id === 1) return ['rescue'];
                        if (id === 2) return ['food'];
                        if (id === 3) return ['shelter'];
                        if (id === 4) return ['medical'];
                        // Fallback: try reading description
                        if (item.emergencyType?.description) return [item.emergencyType.description.toLowerCase()];
                        return [];
                    })(),
                    urgencyLevel: item.ugrencyLevel?.name?.toLowerCase() || item.urgencyLevel?.name?.toLowerCase() || 'medium',
                    numberOfPeople: item.noOfPeople || 1,
                    moreDetails: item.description || item.note || '',
                    contactNumber: item.helpRequestId || 'N/A', // Using helpRequestId as fallback if the backend doesn't provide contact in GET
                    status: (() => {
                        const rawStatus = item.approvalStage?.id || item.approvalStageId;
                        if (rawStatus === 1) return 'pending';
                        if (rawStatus === 2) return 'rejected';
                        if (rawStatus === 3) return 'approved';
                        if (rawStatus === 4) return 'in progress';
                        if (rawStatus === 5) return 'completed';
                        return 'pending';
                    })(),
                    feedback: item.note || item.feedback || '',
                    logs: item.logs || [],
                    timestamp: item.createdOn || new Date().toISOString()
                }));

                const prevRequests = requestsRef.current;
                const isSubsequent = prevRequests.length > 0;

                mapped.forEach(newReq => {
                    const existing = prevRequests.find(r => String(r.id) === String(newReq.id));
                    if (existing) {
                        // If reminder count increased, trigger warning notification
                        if (newReq.reminder > existing.reminder) {
                            notification.warning({
                                message: 'Help Reminder Received!',
                                description: `A reminder was sent for help request from ${newReq.name} (Urgency: ${newReq.urgencyLevel?.toUpperCase()})`,
                                placement: 'topRight',
                                duration: 5,
                                style: {
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 15px rgba(250, 173, 20, 0.2)',
                                    borderLeft: '5px solid #faad14',
                                    background: '#fffbe6'
                                }
                            });
                        }
                    } else if (isSubsequent) {
                        // Brand new emergency help request!
                        notification.error({
                            message: '🚨 EMERGENCY REQUEST RECEIVED!',
                            description: `New request submitted by ${newReq.name} in ${newReq.location} (Urgency: ${newReq.urgencyLevel?.toUpperCase()})`,
                            placement: 'topRight',
                            duration: 8,
                            style: {
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25)',
                                borderLeft: '5px solid #ff4d4f',
                                background: '#fff2f0'
                            }
                        });
                    }
                });

                const nextRequests = mapped.map(newReq => {
                    const existing = prevRequests.find(r => r.id === newReq.id);
                    if (existing) {
                        return {
                            ...newReq,
                            status: existing.status,
                            feedback: existing.feedback,
                            logs: existing.logs || newReq.logs,
                            lastRemindedAt: newReq.reminder > existing.reminder ? new Date().toISOString() : existing.lastRemindedAt
                        };
                    }
                    return newReq;
                });
                requestsRef.current = nextRequests;
                setRequests(nextRequests);
            }
        } catch (error) {
            console.error('Failed to fetch help requests', error);
        }
    };

    useEffect(() => {
        fetchRequests();
        const intervalId = setInterval(fetchRequests, 5000);
        return () => clearInterval(intervalId);
    }, [user]);

    const updateSchema = (newSchema) => {
        setFormSchema(newSchema);
    };

    const updateRequestStatus = async (id, newStatus) => {
        let stageId = 1;
        if (newStatus === 'pending') stageId = 1;
        else if (newStatus === 'rejected') stageId = 2;
        else if (newStatus === 'approved') stageId = 3;
        else if (newStatus === 'in progress') stageId = 4;
        else if (newStatus === 'completed') stageId = 5;

        // Optimistically update UI
        setRequests(requests => {
            const next = requests.map(req => req.id === id ? { ...req, status: newStatus } : req);
            requestsRef.current = next;
            return next;
        });

        try {
            await helpRequestService.updateHelpRequest(id, { approvalStageId: stageId });
            notification.success({ message: 'Status successfully updated!' });
        } catch (error) {
            console.error('Failed to update status on backend', error);
            notification.error({ message: 'Failed to update status' });
            // Revert on error
            fetchRequests();
        }
    };

    const updateRequest = (updatedRequest) => {
        setRequests(requests => {
            const next = requests.map(req => req.id === updatedRequest.id ? updatedRequest : req);
            requestsRef.current = next;
            return next;
        });
    };

    const addRequest = async (newRequest) => {
        try {
            // Mapping frontend model to POST schema
            const payload = {
                name: newRequest.name,
                location: newRequest.location,
                description: newRequest.moreDetails,
                noOfPeople: newRequest.numberOfPeople ? parseInt(newRequest.numberOfPeople) : 1,
                emergencyTypeId: (() => {
                    const et = newRequest.emergencyType;
                    if (et === 1 || et === '1') return 1;
                    if (et === 2 || et === '2') return 2;
                    if (et === 3 || et === '3') return 3;
                    if (et === 4 || et === '4') return 4;
                    // String fallback
                    if (typeof et === 'string') {
                        if (et.toLowerCase() === 'rescue') return 1;
                        if (et.toLowerCase() === 'food') return 2;
                        if (et.toLowerCase() === 'shelter') return 3;
                        if (et.toLowerCase() === 'medical') return 4;
                    }
                    if (Array.isArray(et) && et.length > 0) {
                        const first = et[0];
                        if (first === 1 || first === '1' || first === 'rescue') return 1;
                        if (first === 2 || first === '2' || first === 'food') return 2;
                        if (first === 3 || first === '3' || first === 'shelter') return 3;
                        if (first === 4 || first === '4' || first === 'medical') return 4;
                    }
                    return 1; // default to rescue
                })(),
                ugrencyLevelId: newRequest.urgencyLevel === 'high' ? 3 : newRequest.urgencyLevel === 'medium' ? 2 : 1,
                latitude: 0,
                longitude: 0
            };
            await helpRequestService.createHelpRequest(payload);
            fetchRequests(); // Reload list after successful creation
        } catch (error) {
            console.error('Failed to add request to backend, falling back to local state', error);
            const nextId = requestsRef.current.length > 0 ? Math.max(...requestsRef.current.map(r => r.id)) + 1 : 1;
            setRequests(prev => {
                const next = [...prev, { ...newRequest, id: nextId, status: 'pending', timestamp: new Date().toISOString() }];
                requestsRef.current = next;
                return next;
            });
        }
    };

    const deleteRequest = (id) => {
        setRequests(requests => {
            const next = requests.filter(req => req.id !== id);
            requestsRef.current = next;
            return next;
        });
    };

    return (
        <RequestContext.Provider value={{ formSchema, updateSchema, requests, updateRequestStatus, updateRequest, addRequest, deleteRequest }}>
            {children}
        </RequestContext.Provider>
    );
};

export const useRequest = () => useContext(RequestContext);
