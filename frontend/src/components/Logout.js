// src/components/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await axios.get(`${process.env.REACT_APP_API_URL}/logout`);
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                navigate('/login');
            } catch (error) {
                console.error('Logout error:', error);
                navigate('/');
            }
        };
        logout();
    }, [navigate]);

    return (
        <div className="text-center py-5">
            <h3>Logging out...</h3>
        </div>
    );
}