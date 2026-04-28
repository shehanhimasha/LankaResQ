import React from 'react';
import { Modal, Button, Row, Col, Typography, Tag, Divider, Input } from 'antd';

const HelpDetailsModal = ({
    isModalOpen,
    handleModalClose,
    selectedRequest,
    feedbackText,
    setFeedbackText,
    handleFeedbackSubmit
}) => {
    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>{selectedRequest?.name}</span>
                    <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>{selectedRequest?.id}</span>
                </div>
            }
            open={isModalOpen}
            onCancel={handleModalClose}
            maskClosable={true}
            closable={true}
            footer={[
                <Button
                    key="close"
                    onClick={handleModalClose}
                >
                    Close
                </Button>
            ]}
            width={600}
            centered
        >
            {selectedRequest && (
                <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Type of Emergency</Typography.Text>
                                <Typography.Text strong style={{ fontSize: '15px' }}>{Array.isArray(selectedRequest.emergencyType) ? selectedRequest.emergencyType.join(', ').toUpperCase() : selectedRequest.emergencyType}</Typography.Text>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Contact No</Typography.Text>
                                <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.contactNumber}</Typography.Text>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Location</Typography.Text>
                                <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.location}</Typography.Text>
                            </div>
                        </Col>

                        <Col xs={24} sm={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Urgency Level</Typography.Text>
                                <Tag color={selectedRequest.urgencyLevel === 'high' ? 'red' : selectedRequest.urgencyLevel === 'medium' ? 'orange' : 'green'} style={{ margin: 0 }}>
                                    {selectedRequest.urgencyLevel?.toUpperCase()}
                                </Tag>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>No. of People</Typography.Text>
                                <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.numberOfPeople}</Typography.Text>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Submitted At</Typography.Text>
                                <Typography.Text strong style={{ fontSize: '15px' }}>{new Date(selectedRequest.timestamp).toLocaleString()}</Typography.Text>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                        <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Description</Typography.Text>
                        <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.moreDetails || 'No description provided.'}</Typography.Text>
                    </div>
                </div>
            )}

            {selectedRequest && (
                <div style={{ marginTop: '24px' }}>
                    <Divider style={{ margin: '16px 0' }} />
                    <Typography.Title level={5} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Office Use</Typography.Title>

                    <div>
                        <Typography.Text type="secondary" style={{ display: 'block', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
                            Admin Feedback / Progress Notes
                        </Typography.Text>
                        <Input.TextArea
                            rows={4}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Enter internal feedback, status updates, or actions taken here..."
                            style={{ borderRadius: '6px' }}
                        />
                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                            <Button
                                type="primary"
                                onClick={handleFeedbackSubmit}
                                disabled={!selectedRequest.feedback && !feedbackText.trim()}
                            >
                                {selectedRequest.feedback ? 'Update' : 'Submit'}
                            </Button>
                        </div>
                    </div>

                    {selectedRequest.logs && (
                        <div style={{ marginTop: '24px' }}>
                            <Typography.Text type="secondary" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Action Log</Typography.Text>
                            <div style={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                padding: '8px 12px',
                                background: '#fafafa',
                                border: '1px solid #f0f0f0',
                                borderRadius: '6px'
                            }}>
                                {[...selectedRequest.logs].reverse().map((log, index) => (
                                    <div key={index} style={{ fontSize: '12px', marginBottom: '6px', borderBottom: index < selectedRequest.logs.length - 1 ? '1px dashed #e8e8e8' : 'none', paddingBottom: '4px' }}>
                                        <span style={{ color: '#888', marginRight: '8px' }}>[{log.time}]</span>
                                        <span style={{ fontWeight: 500, marginRight: '4px' }}>{log.adminName}:</span>
                                        <span>{log.action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default HelpDetailsModal;
