import React, { useState } from "react";
import './TeacherRegistration.css';
import axios from 'axios';

function TeacherRegistration(){
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactDetails: '',
        password: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        qualification: '',
        specialisation: '',
        department: '',
        hireDate: ''
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

        const { firstName, lastName, email, contactDetails, password, dateOfBirth, gender, nationality, qualification, specialisation, department, hireDate } = formData;
        
        if (!firstName || !lastName || !email || !contactDetails || !password || !dateOfBirth || !gender || !nationality || !qualification || !specialisation || !department || !hireDate) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/teachers/register', formData);
            setResult(response.data);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                contactDetails: '',
                password: '',
                dateOfBirth: '',
                gender: '',
                nationality: '',
                qualification: '',
                specialisation: '',
                department: '',
                hireDate: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {result && <div className="alert alert-success mb-3">Teacher registered successfully!</div>}
            
            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className="form-control"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className="form-control"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="teacherEmail" className="form-label">Email</label>
                        <input
                            type="email"
                            id="teacherEmail"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="contactDetails" className="form-label">Contact Details</label>
                        <input
                            type="text"
                            id="contactDetails"
                            name="contactDetails"
                            className="form-control"
                            placeholder="e.g +256700123456"
                            value={formData.contactDetails}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="teacherPassword" className="form-label">Password</label>
                        <input
                            type="password"
                            id="teacherPassword"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            className="form-control"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="gender" className="form-label">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            className="form-select"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="nationality" className="form-label">Nationality</label>
                        <select
                            id="nationality"
                            name="nationality"
                            className="form-select"
                            value={formData.nationality}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select nationality</option>
                            <option value="Ugandan">Ugandan</option>
                            <option value="Kenyan">Kenyan</option>
                            <option value="Tanzanian">Tanzanian</option>
                            <option value="Rwandan">Rwandan</option>
                            <option value="South Sudanese">South Sudanese</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="qualification" className="form-label">Qualification</label>
                        <select
                            id="qualification"
                            name="qualification"
                            className="form-select"
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select qualification</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Bachelors">Bachelors</option>
                            <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                            <option value="Masters">Masters</option>
                            <option value="PhD">PhD</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="specialisation" className="form-label">Specialisation</label>
                        <select
                            id="specialisation"
                            name="specialisation"
                            className="form-select"
                            value={formData.specialisation}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select specialisation</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="English Literature">English Literature</option>
                            <option value="History">History</option>
                            <option value="ICT">ICT</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="department" className="form-label">Department</label>
                        <select
                            id="department"
                            name="department"
                            className="form-select"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select department</option>
                            <option value="Science">Science</option>
                            <option value="Languages">Languages</option>
                            <option value="Humanities">Humanities</option>
                            <option value="ICT">ICT</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="hireDate" className="form-label">Hire Date</label>
                        <input
                            type="date"
                            id="hireDate"
                            name="hireDate"
                            className="form-control"
                            value={formData.hireDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
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
}
export default TeacherRegistration;