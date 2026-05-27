import React, { useState, useEffect } from 'react';
import { Button, Drawer, Modal, Form, Input, Select, notification, Spin } from 'antd';
import RoadClosureMap from '../../components/roadClosure/RoadClosureMap';
import RoadClosureSidebar from '../../components/roadClosure/RoadClosureSidebar';
import roadClosureService from '../../services/roadClosureService';
import * as turf from '@turf/turf';

const { Option } = Select;

const RoadClosure = () => {
    const [closures, setClosures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingGeometry, setPendingGeometry] = useState(null);
    const [bulkDetectedRoads, setBulkDetectedRoads] = useState([]);
    const [singleForm] = Form.useForm();
    const [bulkForm] = Form.useForm();

    const normalizeGeometry = (geometry) => {
        if (!geometry) return null;
        if (geometry.type === 'Feature' && geometry.geometry) return geometry.geometry;
        if (geometry.type === 'FeatureCollection' && geometry.features?.length) {
            return geometry.features[0].geometry || geometry.features[0];
        }
        return geometry;
    };

    const fetchClosures = async () => {
        setLoading(true);
        try {
            const data = await roadClosureService.getAll();
            setClosures(data);
        } catch (error) {
            notification.error({ message: 'Failed to fetch road closures' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClosures();
    }, []);

    const getRoadNameFromGeometry = async (geometry) => {
        try {
            const normalized = normalizeGeometry(geometry);
            if (!normalized) return null;

            let coord = null;
            if (normalized.type === 'Point') {
                coord = normalized.coordinates;
            } else if (normalized.type === 'LineString' && normalized.coordinates?.length) {
                coord = normalized.coordinates[Math.floor(normalized.coordinates.length / 2)];
            }

            if (!coord) return null;

            const [lon, lat] = coord;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const address = data?.address || {};
            return (
                address.road ||
                address.pedestrian ||
                address.path ||
                address.cycleway ||
                address.footway ||
                address.neighbourhood ||
                address.suburb ||
                address.city ||
                null
            );
        } catch (error) {
            return null;
        }
    };

    const getRoadFromPoint = async (lon, lat) => {
        try {
            const overpassQuery = `
                [out:json];
                way["highway"](around:40,${lat},${lon});
                out geom;
            `;
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery
            });
            const data = await response.json();
            if (!data?.elements?.length) return null;

            const point = turf.point([lon, lat]);
            let best = null;
            let bestDistance = Number.POSITIVE_INFINITY;

            data.elements.forEach((el) => {
                if (el.type !== 'way' || !Array.isArray(el.geometry)) return;

                const line = {
                    type: 'LineString',
                    coordinates: el.geometry.map((pt) => [pt.lon, pt.lat])
                };

                const distance = turf.pointToLineDistance(point, line, { units: 'meters' });
                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = {
                        name: el.tags?.name || null,
                        geometry: line
                    };
                }
            });

            return best;
        } catch (error) {
            return null;
        }
    };

    const getRoadFromLine = async (lineGeometry) => {
        try {
            if (!lineGeometry?.coordinates?.length) return null;
            const bbox = turf.bbox(lineGeometry);
            const padding = 0.0006; // ~60m
            const minLat = bbox[1] - padding;
            const minLon = bbox[0] - padding;
            const maxLat = bbox[3] + padding;
            const maxLon = bbox[2] + padding;

            const overpassQuery = `
                [out:json];
                way["highway"](${minLat},${minLon},${maxLat},${maxLon});
                out geom;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery
            });
            const data = await response.json();
            if (!data?.elements?.length) return null;

            let best = null;
            let bestScore = Number.POSITIVE_INFINITY;

            data.elements.forEach((el) => {
                if (el.type !== 'way' || !Array.isArray(el.geometry)) return;
                const roadLine = {
                    type: 'LineString',
                    coordinates: el.geometry.map((pt) => [pt.lon, pt.lat])
                };

                const distances = lineGeometry.coordinates.map((coord) =>
                    turf.pointToLineDistance(turf.point(coord), roadLine, { units: 'meters' })
                );
                const avgDistance = distances.reduce((sum, value) => sum + value, 0) / distances.length;

                if (avgDistance < bestScore) {
                    bestScore = avgDistance;
                    best = {
                        name: el.tags?.name || null,
                        geometry: roadLine
                    };
                }
            });

            return best;
        } catch (error) {
            return null;
        }
    };

    const handleDrawCreated = async (geometry) => {
        setPendingGeometry(geometry);
        setIsSingleModalOpen(true);
        singleForm.setFieldsValue({ roadName: 'Unknown Road' });

        const normalized = normalizeGeometry(geometry);
        let midpoint = null;
        if (normalized?.type === 'LineString' && normalized.coordinates?.length) {
            midpoint = normalized.coordinates[Math.floor(normalized.coordinates.length / 2)];
        } else if (normalized?.type === 'Point') {
            midpoint = normalized.coordinates;
        }

        if (midpoint) {
            const [lon, lat] = midpoint;
            const road = normalized?.type === 'LineString'
                ? await getRoadFromLine(normalized)
                : await getRoadFromPoint(lon, lat);
            if (road?.geometry) {
                let clippedGeometry = road.geometry;

                if (normalized?.type === 'LineString' && normalized.coordinates?.length >= 2) {
                    const start = turf.point(normalized.coordinates[0]);
                    const end = turf.point(normalized.coordinates[normalized.coordinates.length - 1]);
                    const snappedStart = turf.nearestPointOnLine(road.geometry, start);
                    const snappedEnd = turf.nearestPointOnLine(road.geometry, end);
                    const sliced = turf.lineSlice(snappedStart, snappedEnd, road.geometry);
                    if (sliced?.geometry?.coordinates?.length) {
                        clippedGeometry = sliced.geometry;
                    }
                }

                setPendingGeometry(clippedGeometry);
                if (road.name) {
                    singleForm.setFieldsValue({ roadName: road.name });
                    return;
                }
            }
        }

        const roadName = await getRoadNameFromGeometry(geometry);
        if (roadName) {
            singleForm.setFieldsValue({ roadName });
        }
    };

    const handleZoneCreated = async (geometry) => {
        setLoading(true);
        try {
            // Use Overpass API to get roads within the polygon
            // This is a simplified approach
            const bbox = turf.bbox(geometry);
            const overpassQuery = `
                [out:json];
                (
                  way["highway"](${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]});
                );
                out geom;
            `;
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery
            });
            const data = await response.json();
            
            // Filter roads that actually intersect the polygon using turf
            const roadsFound = [];
            if (data.elements) {
                // Simplified: just taking the first few elements that are ways
                data.elements.forEach(el => {
                    if (el.type === 'way' && el.tags && el.tags.name && Array.isArray(el.geometry)) {
                        const line = {
                            type: 'LineString',
                            coordinates: el.geometry.map((point) => [point.lon, point.lat])
                        };
                        roadsFound.push({
                            name: el.tags.name,
                            id: el.id,
                            geometry: line
                        });
                    }
                });
            }

            const uniqueRoads = [...new Map(roadsFound.map(item => [item.name, item])).values()];
            setBulkDetectedRoads(uniqueRoads);
            setPendingGeometry(geometry);
            setIsBulkModalOpen(true);
        } catch (error) {
            notification.error({ message: 'Failed to detect roads in zone' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchFound = (result) => {
        // Allow user to mark the searched road
        Modal.confirm({
            title: 'Road Found',
            content: `Do you want to mark "${result.display_name}" as blocked?`,
            onOk: () => {
                setPendingGeometry({
                    type: "Point", // Nominatim returns a point, but we could try to get the way
                    coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
                });
                setIsSingleModalOpen(true);
                singleForm.setFieldsValue({ roadName: result.display_name.split(',')[0] });
            }
        });
    };

    const handleSaveSingle = async () => {
        const values = await singleForm.validateFields();
        try {
            const normalizedGeometry = normalizeGeometry(pendingGeometry);
            await roadClosureService.create({
                ...values,
                geometryGeoJson: JSON.stringify(normalizedGeometry)
            });
            notification.success({ message: 'Road closure saved' });
            setIsSingleModalOpen(false);
            singleForm.resetFields();
            fetchClosures();
        } catch (error) {
            notification.error({ message: 'Failed to save road closure' });
        }
    };

    const handleSaveBulk = async () => {
        const values = await bulkForm.validateFields();
        try {
            // In a real app, we'd pass the actual geometries of the detected roads
            // For now, we'll simulate by creating closures for the names
            await roadClosureService.bulkCreate({
                roadNames: bulkDetectedRoads.map(r => r.name),
                reason: values.reason,
                status: values.status,
                geometriesGeoJson: bulkDetectedRoads.map((road) => JSON.stringify(road.geometry))
            });
            notification.success({ message: `Bulk created ${bulkDetectedRoads.length} closures` });
            setIsBulkModalOpen(false);
            bulkForm.resetFields();
            fetchClosures();
        } catch (error) {
            notification.error({ message: 'Failed to create bulk closures' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await roadClosureService.delete(id);
            notification.success({ message: 'Closure removed' });
            fetchClosures();
        } catch (error) {
            notification.error({ message: 'Failed to delete closure' });
        }
    };

    const handleBulkDelete = async () => {
        try {
            await roadClosureService.bulkDelete(selectedIds);
            notification.success({ message: 'Bulk delete successful' });
            setSelectedIds([]);
            fetchClosures();
        } catch (error) {
            notification.error({ message: 'Failed to perform bulk delete' });
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Button type="primary" onClick={() => setIsSidebarOpen(true)}>
                    Active Closures
                </Button>
            </div>
            <Spin spinning={loading}>
                <RoadClosureMap 
                    closures={closures} 
                    onDrawCreated={handleDrawCreated}
                    onZoneCreated={handleZoneCreated}
                    onSearchFound={handleSearchFound}
                />
            </Spin>

            <Drawer
                title="Active Closures"
                placement="right"
                width={380}
                open={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                bodyStyle={{ padding: 0 }}
            >
                <RoadClosureSidebar 
                    closures={closures}
                    selectedIds={selectedIds}
                    onSelectChange={setSelectedIds}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}
                    showTitle={false}
                    asDrawer
                />
            </Drawer>

            {/* Single Creation Modal */}
            <Modal
                title="Add Road Closure"
                open={isSingleModalOpen}
                onOk={handleSaveSingle}
                onCancel={() => {
                    setIsSingleModalOpen(false);
                    singleForm.resetFields();
                }}
            >
                <Form form={singleForm} layout="vertical">
                    <Form.Item name="roadName" label="Road Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Flooding">Flooding</Option>
                            <Option value="Landslide">Landslide</Option>
                            <Option value="Road Damage">Road Damage</Option>
                            <Option value="Bridge Collapse">Bridge Collapse</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="blocked">
                        <Select>
                            <Option value="blocked">Fully Blocked</Option>
                            <Option value="partial">Partially Blocked</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Bulk Confirmation Modal */}
            <Modal
                title="Confirm Bulk Closure"
                open={isBulkModalOpen}
                onOk={handleSaveBulk}
                onCancel={() => {
                    setIsBulkModalOpen(false);
                    bulkForm.resetFields();
                }}
            >
                <div style={{ marginBottom: 16 }}>
                    <strong>{bulkDetectedRoads.length}</strong> roads detected in this zone. Mark all as blocked?
                    <ul style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                        {bulkDetectedRoads.map((r, i) => <li key={i}>{r.name}</li>)}
                    </ul>
                </div>
                <Form form={bulkForm} layout="vertical">
                    <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Flooding">Flooding</Option>
                            <Option value="Landslide">Landslide</Option>
                            <Option value="Road Damage">Road Damage</Option>
                            <Option value="Bridge Collapse">Bridge Collapse</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="blocked">
                        <Select>
                            <Option value="blocked">Fully Blocked</Option>
                            <Option value="partial">Partially Blocked</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoadClosure;