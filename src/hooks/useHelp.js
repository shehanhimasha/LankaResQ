import { useState } from 'react';
import { Form, message, Modal } from 'antd';
import { useRequest } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import helpRequestService from '../services/helpRequestService';

const useHelp = () => {
    const { requests, updateRequestStatus, updateRequest, deleteRequest, addRequest } = useRequest();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [form] = Form.useForm();

    const currentUserName = user?.name || 'System Admin';
    const currentUserEmail = user?.email || 'admin@lankaresq.com';

    const handleCreateSubmit = (values) => {
        const newRequest = {
            name: values.name,
            emergencyType: values.emergencyType,
            urgencyLevel: values.urgencyLevel,
            numberOfPeople: values.numberOfPeople,
            moreDetails: values.description || '',
            contactNumber: values.contactNo,
            location: values.location,
            reminder: 0,
            logs: [{
                action: 'Request Created',
                time: new Date().toLocaleString(),
                adminName: currentUserName,
                adminEmail: currentUserEmail // Added for dynamic name lookup
            }]
        };
        addRequest(newRequest);
        message.success('New help request created manually!');
        setIsCreateModalOpen(false);
        form.resetFields();
    };

    const handleCreateCancel = () => {
        setIsCreateModalOpen(false);
        form.resetFields();
    };

    const handleView = (record) => {
        let updatedRecord = { ...record };

        if (!updatedRecord.logs) {
            updatedRecord.logs = [];
        }

        updatedRecord.logs.push({
            action: 'Viewed Request',
            time: new Date().toLocaleString(),
            adminName: currentUserName,
            adminEmail: currentUserEmail // Added
        });

        updateRequest(updatedRecord);

        setSelectedRequest(updatedRecord);
        setFeedbackText(updatedRecord.feedback || '');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedRequest(null);
            setFeedbackText('');
        }, 300);
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) {
            message.error('Please enter feedback.');
            return;
        }

        const isFirstSubmit = !selectedRequest.feedback;
        const isFeedbackChanged = selectedRequest.feedback !== feedbackText;

        const updatedRecord = {
            ...selectedRequest,
            feedback: feedbackText,
            status: 'in progress',
        };

        if (!updatedRecord.logs) {
            updatedRecord.logs = [];
        }

        if (isFirstSubmit || isFeedbackChanged) {
            updatedRecord.logs.push({
                action: isFirstSubmit ? 'Submitted Feedback' : 'Updated Feedback',
                time: new Date().toLocaleString(),
                adminName: currentUserName,
                adminEmail: currentUserEmail // Added
            });

            try {
                // Send feedback as note to the API, and change status id (4 = in progress)
                await helpRequestService.updateHelpRequest(selectedRequest.id, {
                    note: feedbackText,
                    approvalStageId: 4
                });
            } catch (error) {
                console.error("Failed saving feedback to db:", error);
                message.error('Failed to save feedback to server');
            }
        }

        updateRequest(updatedRecord);
        setSelectedRequest(updatedRecord);
        message.success(isFirstSubmit ? 'Feedback submitted successfully!' : 'Feedback updated successfully!');

        if (isFirstSubmit || isFeedbackChanged) {
            setIsModalOpen(false);
            setTimeout(() => {
                setSelectedRequest(null);
                setFeedbackText('');
            }, 300);
        }
    };

    const handleComplete = (record) => {
        const updatedRecord = {
            ...record,
            status: 'success',
            logs: [
                ...(record.logs || []),
                {
                    action: 'Marked as Completed',
                    time: new Date().toLocaleString(),
                    adminName: currentUserName,
                    adminEmail: currentUserEmail // Added
                }
            ]
        };
        updateRequest(updatedRecord);
        message.success(`Request ${record.id} marked as completed.`);
    };

    const handleDelete = (record) => {
        deleteRequest(record.id);
        message.success(`Request ${record.id} permanently deleted.`);
    };

    const showDeleteConfirm = (record) => {
        Modal.confirm({
            title: 'Delete Help Request',
            content: `Are you sure you want to permanently delete the request from ${record.name} (${record.id})?`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk() {
                handleDelete(record);
            },
        });
    };

    return {
        requests,
        searchQuery,
        setSearchQuery,
        isModalOpen,
        isCreateModalOpen,
        setIsCreateModalOpen,
        selectedRequest,
        feedbackText,
        setFeedbackText,
        form,
        handleCreateSubmit,
        handleCreateCancel,
        handleView,
        handleModalClose,
        handleFeedbackSubmit,
        handleComplete,
        showDeleteConfirm,
        updateRequestStatus,
    };
};

export default useHelp;
