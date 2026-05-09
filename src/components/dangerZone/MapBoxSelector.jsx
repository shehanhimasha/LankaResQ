import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapBoxSelector = ({ onAreaSelected, onMapClick, selectionMode }) => {
    const map = useMap();

    useEffect(() => {
        // If selectionMode is active, disable panning to allow dragging for selection
        if (selectionMode) {
            map.dragging.disable();
            // Change cursor to crosshair
            const container = map.getContainer();
            container.style.cursor = 'crosshair';
        } else {
            map.dragging.enable();
            const container = map.getContainer();
            container.style.cursor = '';
        }

        let startLatLng = null;
        let selectionRectangle = null;
        let isDragging = false;
        let isShiftDown = false;

        const handleKeyDown = (e) => {
            if (e.key === 'Shift') {
                isShiftDown = true;
                if (!selectionMode) map.dragging.disable();
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Shift') {
                isShiftDown = false;
                if (!selectionMode) map.dragging.enable();
            }
        };

        const handleMouseDown = (e) => {
            if (e.originalEvent.button !== 0) return;
            // Start box selection if in selection mode OR Shift is held
            if (selectionMode || isShiftDown) {
                startLatLng = e.latlng;
                isDragging = false;
            }
        };

        const handleMouseMove = (e) => {
            if (!startLatLng) return;
            isDragging = true;
            
            if (!selectionRectangle) {
                selectionRectangle = L.rectangle([startLatLng, e.latlng], { 
                    color: '#1890ff', 
                    weight: 2, 
                    fillColor: '#1890ff', 
                    fillOpacity: 0.2,
                    dashArray: '5, 5'
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
            }
            startLatLng = null;
            selectionRectangle = null;
            isDragging = false;
        };

        const handleClick = (e) => {
            // Only trigger map click (add pin) if we are NOT in selection mode AND not dragging
            if (!selectionMode && !isShiftDown) {
                onMapClick(e.latlng);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);
        map.on('click', handleClick);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
            map.off('click', handleClick);
            if (selectionRectangle) map.removeLayer(selectionRectangle);
            
            // Restore default cursor on cleanup
            const container = map.getContainer();
            if (container) container.style.cursor = '';
        };
    }, [map, onAreaSelected, onMapClick, selectionMode]);

    return null;
};

export default MapBoxSelector;
