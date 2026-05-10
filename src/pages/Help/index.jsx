import React from 'react';
import { Typography, Space, Input, Button, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useHelp from '../../hooks/useHelp';
import HelpTable from '../../components/help/HelpTable';
import HelpDetailsModal from '../../components/help/HelpDetailsModal';
import CreateRequestModal from '../../components/help/CreateRequestModal';

const { Title } = Typography;

const Help = () => {
    const {
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
    } = useHelp();
    const { token: { colorBgContainer } } = theme.useToken();

    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0 }}>Help Requests</Title>
                <Space size="middle">
                    <Input.Search
                        placeholder="Search by ID, Name, Location or Status"
                        allowClear
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 350 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        New Request
                    </Button>
                </Space>
            </div>

            <HelpTable 
                requests={requests}
                searchQuery={searchQuery}
                handleView={handleView}
                handleComplete={handleComplete}
                showDeleteConfirm={showDeleteConfirm}
            />

            <HelpDetailsModal 
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                selectedRequest={selectedRequest}
                feedbackText={feedbackText}
                setFeedbackText={setFeedbackText}
                handleFeedbackSubmit={handleFeedbackSubmit}
            />

            <CreateRequestModal 
                isCreateModalOpen={isCreateModalOpen}
                handleCreateCancel={handleCreateCancel}
                form={form}
                handleCreateSubmit={handleCreateSubmit}
            />
        </div>
    );
};

export default Help;
