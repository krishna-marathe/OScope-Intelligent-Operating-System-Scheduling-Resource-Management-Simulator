import axios from 'axios';

export const analyzeCpu = async (workload: any[], results: any[]) => {
    const res = await axios.post('/api/v1/intelligence/analyze/cpu', { workload, results });
    return res.data;
};