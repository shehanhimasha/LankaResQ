import React from 'react';
import { Typography, Input, Button, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import useShelters from '../../hooks/useShelters';
import SheltersTable from '../../components/shelters/SheltersTable';
import ShelterFormModal from '../../components/shelters/ShelterFormModal';

const { Title } = Typography;

const Shelters = () => {
    const {
        shelters,
        filteredShelters,
        isModalVisible,
        setIsModalVisible,
        searchText,
        setSearchText,
        form,
        handleAddShelter,
        handleDelete,
        updateShelterStatus
    } = useShelters();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title level={2} style={{ margin: 0 }}>Shelter Management</Title>
                    <Input
                        placeholder="Search shelters..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} size="large">
                    Add New Shelter
                </Button>
            </div>

            <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <SheltersTable 
                    shelters={shelters}
                    filteredShelters={filteredShelters}
                    updateShelterStatus={updateShelterStatus}
                    handleDelete={handleDelete}
                />
            </Card>

            <ShelterFormModal 
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                form={form}
                handleAddShelter={handleAddShelter}
            />
        </div>
    );
};

export default Shelters;
