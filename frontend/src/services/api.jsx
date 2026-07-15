import axios from 'axios';
import server from '../environment';

const API = axios.create({
    baseURL: `${server}/api/`,
    withCredentials: true,
});

export const signup = (data) => API.post('/users/register', data);
export const login = (data) => API.post('/users/login', data);
export const logout = () => API.post('/users/logout');
export const getUsers = () => API.get('/users');
export const me = () => API.get('/users/me');
export const updateProfile = (data) => API.put('/users/profile', data);


