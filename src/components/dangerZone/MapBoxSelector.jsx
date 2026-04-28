import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapBoxSelector = ({ onAreaSelected, onMapClick }) => {
    const map = useMap();

    useEffect(() => {
        map.dragging.disable();

        let startLatLng = null;
        let selectionRectangle = null;

        let isDragging = false;

        const handleMouseDown = (e) => {
            if (e.originalEvent.button !== 0) return;
            startLatLng = e.latlng;
            isDragging = false;
        };

        const handleMouseMove = (e) => {
            if (!startLatLng) return;
            isDragging = true;
            
            if (!selectionRectangle) {
                selectionRectangle = L.rectangle([startLatLng, e.latlng], { 
                    color: '#1890ff', 
                    weight: 1, 
                    fillColor: '#1890ff', 
                    fillOpacity: 0.2,
                    dashArray: '3'
                }).addTo(map);
            } else {
                selectionRectangle.setBounds([startLatLng, e.latlng]);
            }
        };

        const handleMouseUp = (e) => {
            if (isDragging && startLatLng && selectionRectangle) {
                const bounds = L.latLngBounds(startLatLng, e.latlng);
                onAreaSelected(bounds);
                map.removeLayer(selectionRectangle);
            } else if (!isDragging && startLatLng) {
                onMapClick(startLatLng);
            }
            startLatLng = null;
            selectionRectangle = null;
            isDragging = false;
        };

        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
            if (selectionRectangle) map.removeLayer(selectionRectangle);
            map.dragging.enable();
        };
    }, [map, onAreaSelected, onMapClick]);

    return null;
};

export default MapBoxSelector;
