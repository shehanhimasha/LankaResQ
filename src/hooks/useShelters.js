import { useState } from 'react';
import { Form, message, Modal } from 'antd';
import { useShelter } from '../context/ShelterContext';

const useShelters = () => {
    const { shelters, addShelter, updateShelterStatus, deleteShelter } = useShelter();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const handleAddShelter = (values) => {
        addShelter(values);
        message.success('Shelter added successfully');
        setIsModalVisible(false);
        form.resetFields();
    };

    const filteredShelters = shelters.filter(shelter =>
        shelter.name.toLowerCase().includes(searchText.toLowerCase()) ||
        shelter.location.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure delete this shelter?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                deleteShelter(id);
                message.success('Shelter deleted');
            },
        });
    };

    return {
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
    };
};

export default useShelters;
