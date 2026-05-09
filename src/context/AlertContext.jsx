import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAlerts, sendAlertWebhook } from '../services/alertService';
import { message } from 'antd';

const AlertContext = createContext(null);

const normalizeAlert = (alert) => {
    // The backend uses flattened camelCase properties:
    // id, alertId, severityLevel, eventType, title, shortMessage, detailedMessage, 
    // recommendedActions, areaName, district, waterLevel, rainfall, confidence, issuedAt
    
    return {
        ...alert,
        id: alert.id || alert.alertId || alert.alert_id || alert.AlertId,
        alert_id: alert.alertId || alert.alert_id || alert.AlertId || `ALT-${alert.id}`,
        title: alert.title || alert.Title || 'Untitled Alert',
        severity_level: alert.severityLevel || alert.severity_level || alert.SeverityLevel || alert.severity || alert.Severity || 'NORMAL',
        event_type: alert.eventType || alert.event_type || alert.EventType || alert.type || 'Unknown',
        location: {
            name: alert.areaName || alert.location?.name || alert.LocationName || 'Unknown',
            district: alert.district || alert.location?.district || alert.LocationDistrict || 'Unknown',
            station_code: alert.stationCode || alert.location?.station_code || alert.StationCode || 'N/A'
        },
        metrics: {
            water_level_m: alert.waterLevel !== undefined ? alert.waterLevel : (alert.metrics?.water_level_m || alert.WaterLevelM || 0),
            rainfall_mm: alert.rainfall !== undefined ? alert.rainfall : (alert.metrics?.rainfall_mm || alert.RainfallMm || 0)
        },
        created_at: alert.issuedAt || alert.created_at || alert.CreatedAt || alert.createdAt || new Date().toISOString(),
        confidence: alert.confidence !== undefined ? alert.confidence : (alert.Confidence || 0),
        short_message: alert.shortMessage || alert.short_message || alert.ShortMessage || '',
        detailed_message: alert.detailedMessage || alert.detailed_message || alert.DetailedMessage || '',
        recommended_action: alert.recommendedActions || alert.recommended_action || alert.RecommendedAction || []
    };
};

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const data = await getAlerts();
            const items = Array.isArray(data) ? data : (data?.items || []);
            setAlerts(items.map(normalizeAlert));
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            // Fallback to local storage if API fails
            const storedAlerts = localStorage.getItem('disaster_alerts');
            if (storedAlerts) {
                const parsed = JSON.parse(storedAlerts);
                setAlerts(parsed.map(normalizeAlert));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    // Save alerts to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('disaster_alerts', JSON.stringify(alerts));
    }, [alerts]);

    const submitAlert = async (alertData) => {
        setLoading(true);
        try {
            // Add required metadata
            const fullAlertData = {
                ...alertData,
                alert_id: alertData.alert_id || `ALT-${Date.now()}`,
                created_at: new Date().toISOString(),
                confidence: alertData.confidence || 0.95
            };

            await sendAlertWebhook(fullAlertData);
            
            // Add to local list
            const newAlert = normalizeAlert(fullAlertData);
            setAlerts(prev => [newAlert, ...prev]);
            
            message.success('Alert sent successfully to disaster management system');
            return true;
        } catch (error) {
            console.error('Failed to send alert:', error);
            message.error('Failed to send alert webhook. Check console for details.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        message.success('Alert record removed from management panel');
    };

    const updateAlertLocal = (id, updatedData) => {
        setAlerts(prev => prev.map(a => a.id === id ? normalizeAlert({ ...a, ...updatedData }) : a));
        message.success('Alert record updated locally');
    };

    return (
        <AlertContext.Provider value={{ alerts, loading, fetchAlerts, deleteAlert, updateAlertLocal }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);
