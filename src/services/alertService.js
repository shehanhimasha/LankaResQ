import axios from 'axios';

const WEBHOOK_URL = 'http://disastermgtpro.runasp.net/api/Alerts/internal/webhook';
const API_KEY = 'secure-api-key';

export const sendAlertWebhook = async (alertData) => {
    try {
        const response = await axios.post(WEBHOOK_URL, alertData, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending alert webhook:', error);
        throw error;
    }
};

export const getAlerts = async () => {
    try {
        const response = await axios.get('http://disastermgtpro.runasp.net/api/Alerts', {
            headers: {
                'X-Api-Key': API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        throw error;
    }
};
