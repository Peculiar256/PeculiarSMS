import React, { useState } from 'react';
import axios from 'axios';

const StudentRegistration = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('http://localhost:8080/api/students/register', formData);
            setResult(response.data);
            setFormData({ email: '', password: '' });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {result && <div className="alert alert-success mb-3">Student registered successfully!</div>}
            
            <div className="mb-3">
                <label htmlFor="studentEmail" className="form-label">Email</label>
                <input
                    type="email"
                    id="studentEmail"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="studentPassword" className="form-label">Password</label>
                <input
                    type="password"
                    id="studentPassword"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </div>
        </form>
    );
};

export default StudentRegistration;