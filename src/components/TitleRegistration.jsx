// src/components/TitleRegistration/TitleRegistration.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitleRegistry } from '../context/TitleRegistryContext';
import { AuthContext } from '../context/AuthContext';
import { registerTitle } from '../services/titleService';
import './TitleRegistration.css';

const TitleRegistration = () => {
    const { currentUser } = useContext(AuthContext);
    const titleRegistry = useTitleRegistry();
    const navigate = useNavigate();
    
    const [form, setForm] = useState({
        titleId: '',
        owner: '',
        area: '',
        coordinates: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        try {
            // Ensure registry is initialized
            await titleRegistry.initialize(currentUser.id);
            
            // Register the title
            await titleRegistry.registerTitle({
                id: form.titleId,
                owner: form.owner,
                area: form.area,
                coordinates: form.coordinates
            });
            
            setSuccess(true);
            setTimeout(() => navigate('/titles'), 1500);
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="registration-container">
            <h2>Register New Title</h2>
            
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">Title registered successfully!</div>}

            <form onSubmit={handleSubmit}>
                {/* Form fields remain the same */}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register Title'}
                </button>
            </form>
        </div>
    );
};

export default TitleRegistration;