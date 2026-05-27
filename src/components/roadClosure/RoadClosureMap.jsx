import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw'; // Direct import of leaflet-draw

// Fix for default marker icons which often break in build tools
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { Card, Radio, Tooltip, Badge, Typography, Space, Input } from 'antd';
import { DragOutlined, LineOutlined, ShrinkOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Search } = Input;

// Custom drawing control component since react-leaflet-draw is incompatible with react-leaflet v4/v5
const DrawingControls = ({ mode, onCreated }) => {
    const map = useMap();
    const drawControlRef = useRef(null);
    const featureGroupRef = useRef(new L.FeatureGroup());

    useEffect(() => {
        map.addLayer(featureGroupRef.current);

        const handleCreated = (e) => {
            const layer = e.layer;
            featureGroupRef.current.addLayer(layer);
            onCreated(e);
            // Remove the layer immediately so it can be managed by external state if needed
            featureGroupRef.current.removeLayer(layer);
        };

        map.on(L.Draw.Event.CREATED, handleCreated);

        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
            }
        };
    }, [map, onCreated]);

    useEffect(() => {
        if (drawControlRef.current) {
            map.removeControl(drawControlRef.current);
        }

        if (mode === 'pan') return;

        const drawOptions = {
            draw: {
                polyline: mode === 'polyline',
                polygon: mode === 'polygon',
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
            },
            edit: {
                featureGroup: featureGroupRef.current,
                remove: false
            }
        };

        drawControlRef.current = new L.Control.Draw(drawOptions);
        map.addControl(drawControlRef.current);

        // Programmatically trigger draw start if button clicked
        if (mode === 'polyline') {
            new L.Draw.Polyline(map, drawOptions.draw.polyline).enable();
        } else if (mode === 'polygon') {
            new L.Draw.Polygon(map, drawOptions.draw.polygon).enable();
        }

    }, [mode, map]);

    return null;
};

const SearchField = ({ onSearch }) => {
    const map = useMap();
    const handleSearch = async (value) => {
        if (!value) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value + ', Sri Lanka')}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const center = [parseFloat(lat), parseFloat(lon)];
                map.setView(center, 16);
                onSearch({ lat, lon, display_name });
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    return (
        <div style={{ position: 'absolute', top: 10, left: 50, zIndex: 1000, width: 300 }}>
            <Search
                placeholder="Search road name..."
                onSearch={handleSearch}
                enterButton
                style={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            />
        </div>
    );
};

const RoadClosureMap = ({ closures, onDrawCreated, onZoneCreated, onSearchFound }) => {
    const [drawMode, setDrawMode] = useState('pan'); // pan, polyline, polygon

    const renderPopup = (closure) => (
        <Popup>
            <div style={{ padding: '5px' }}>
                <Typography.Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                    {closure.roadName}
                </Typography.Title>
                <Space direction="vertical" size={2}>
                    <div><Badge status={closure.status === 'blocked' ? 'error' : 'warning'} text={closure.status.toUpperCase()} /></div>
                    <div><WarningOutlined /> <Text strong>{closure.reason}</Text></div>
                    <div><ClockCircleOutlined /> <Text type="secondary" style={{ fontSize: '11px' }}>{new Date(closure.blockedAt).toLocaleString()}</Text></div>
                </Space>
            </div>
        </Popup>
    );

    const toLatLng = (coord) => [coord[1], coord[0]];

    const renderGeometry = (closure) => {
        const geojson = typeof closure.geometryGeoJson === 'string'
            ? JSON.parse(closure.geometryGeoJson)
            : closure.geometryGeoJson;

        if (!geojson || !geojson.type) return null;

        const color = closure.status === 'blocked' ? '#ff4d4f' : '#faad14';

        if (geojson.type === 'LineString') {
            const positions = geojson.coordinates.map(toLatLng);
            return (
                <Polyline key={closure.id} positions={positions} color={color} weight={5}>
                    {renderPopup(closure)}
                </Polyline>
            );
        }

        if (geojson.type === 'MultiLineString') {
            return geojson.coordinates.map((line, index) => (
                <Polyline key={`${closure.id}-line-${index}`} positions={line.map(toLatLng)} color={color} weight={5}>
                    {renderPopup(closure)}
                </Polyline>
            ));
        }

        if (geojson.type === 'Point') {
            const position = toLatLng(geojson.coordinates);
            return (
                <CircleMarker key={closure.id} center={position} radius={7} pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}>
                    {renderPopup(closure)}
                </CircleMarker>
            );
        }

        if (geojson.type === 'Polygon') {
            const rings = geojson.coordinates.map((ring) => ring.map(toLatLng));
            return (
                <Polygon key={closure.id} positions={rings} pathOptions={{ color, fillColor: color, fillOpacity: 0.2 }}>
                    {renderPopup(closure)}
                </Polygon>
            );
        }

        if (geojson.type === 'MultiPolygon') {
            return geojson.coordinates.map((polygon, index) => (
                <Polygon
                    key={`${closure.id}-poly-${index}`}
                    positions={polygon.map((ring) => ring.map(toLatLng))}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.2 }}
                >
                    {renderPopup(closure)}
                </Polygon>
            ));
        }

        return null;
    };

    const onCreated = (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polyline') {
            const geojson = layer.toGeoJSON();
            onDrawCreated(geojson.geometry || geojson);
        } else if (layerType === 'polygon') {
            const geojson = layer.toGeoJSON();
            onZoneCreated(geojson.geometry || geojson);
        }
        setDrawMode('pan'); // Reset to pan after drawing
    };

    return (
        <Card 
            bordered={false} 
            styles={{ body: { padding: 0, height: '100%' } }}
            style={{ height: 'calc(100vh - 120px)', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                zIndex: 1000, 
                backgroundColor: 'white', 
                padding: '4px', 
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <Radio.Group 
                    value={drawMode} 
                    onChange={(e) => setDrawMode(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Tooltip title="Pan Mode" placement="left">
                        <Radio.Button value="pan"><DragOutlined /></Radio.Button>
                    </Tooltip>
                    <Tooltip title="Draw Blocked Road" placement="left">
                        <Radio.Button value="polyline"><LineOutlined /></Radio.Button>
                    </Tooltip>
                    <Tooltip title="Draw Affected Zone" placement="left">
                        <Radio.Button value="polygon"><ShrinkOutlined /></Radio.Button>
                    </Tooltip>
                </Radio.Group>
            </div>

            <MapContainer 
                center={[6.9271, 79.8612]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                
                <SearchField onSearch={onSearchFound} />
                
                <DrawingControls mode={drawMode} onCreated={onCreated} />

                {closures.map((closure) => {
                    try {
                        return renderGeometry(closure);
                    } catch (err) {
                        console.error('Error parsing geometry for closure', closure.id, err);
                        return null;
                    }
                })}
            </MapContainer>
        </Card>
    );
};

export default RoadClosureMap;