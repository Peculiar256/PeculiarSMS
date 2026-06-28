import React, { useMemo, useState, useEffect } from "react";
import axiosInstance from '../../services/axiosInstance';
import './Users.css';

function Staff() {
	const [staff, setStaff] = useState([]);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [filterField, setFilterField] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [addError, setAddError] = useState("");
	const [recentAddedStaff, setRecentAddedStaff] = useState(0);
	const [viewStaff, setViewStaff] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [selectedStaffForStatus, setSelectedStaffForStatus] = useState(null);
	const [editError, setEditError] = useState("");
	const [departments, setDepartments] = useState([]);
	const [addFormData, setAddFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		department: "",
		position: "",
		joinDate: "",
		contractType: "PERMANENT",
		salary: "",
		qualification: "",
		experience: "",
	});
	const [editFormData, setEditFormData] = useState({
		id: null,
		staffId: "",
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		department: "",
		position: "",
		status: "ACTIVE",
		joinDate: "",
		contractType: "PERMANENT",
		salary: "",
		qualification: "",
		experience: "",
	});

	useEffect(() => {
		loadStaff();
		loadDepartments();
	}, []);

	const loadStaff = async () => {
		try {
			const response = await axiosInstance.get('/staff');
			const data = response.data;
			const staffList = Array.isArray(data?.staff) ? data.staff : (Array.isArray(data) ? data : []);
			setStaff(staffList);
		} catch (err) {
			setMessage({ type: "error", text: "Failed to load staff: " + (err.response?.data?.message || err.message) });
		}
	};

	const loadDepartments = async () => {
		try {
			const response = await axiosInstance.get('/departments');
			const data = response.data;
			const deptList = data.data || [];
			setDepartments(
				deptList.map((d) => (typeof d === 'string' ? d : d.name || d)).filter(Boolean)
			);
		} catch (err) {
			console.error('Failed to load departments:', err);
			setDepartments([]);
		}
	};

	const filteredStaff = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();

		if (!normalizedTerm) {
			return staff;
		}

		return staff.filter((s) => {
			const idText = s.staffId?.toLowerCase() || "";
			const nameText = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
			const emailText = s.email?.toLowerCase() || "";
			const deptText = s.department?.toLowerCase() || "";
			const posText = s.position?.toLowerCase() || "";

			if (filterField === "id") {
				return idText.includes(normalizedTerm);
			}

			if (filterField === "name") {
				return nameText.includes(normalizedTerm);
			}

			if (filterField === "email") {
				return emailText.includes(normalizedTerm);
			}

			if (filterField === "department") {
				return deptText.includes(normalizedTerm);
			}

			return (
				idText.includes(normalizedTerm) ||
				nameText.includes(normalizedTerm) ||
				emailText.includes(normalizedTerm) ||
				deptText.includes(normalizedTerm) ||
				posText.includes(normalizedTerm)
			);
		});
	}, [filterField, searchTerm, staff]);

	const totalStaff = staff.length;
	const activeStaff = useMemo(
		() => staff.filter((s) => s.status === "ACTIVE").length,
		[staff]
	);
	const onLeaveStaff = useMemo(
		() => staff.filter((s) => s.status === "ON_LEAVE").length,
		[staff]
	);
	const terminatedStaff = useMemo(
		() => staff.filter((s) => s.status === "TERMINATED" || s.status === "SUSPENDED").length,
		[staff]
	);

	const openAddModal = () => {
		setAddError("");
		setIsAddModalOpen(true);
	};

	const closeAddModal = () => {
		setAddError("");
		setIsAddModalOpen(false);
	};

	const handleAddInputChange = (event) => {
		const { name, value } = event.target;
		setAddFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEditInputChange = (event) => {
		const { name, value } = event.target;
		setEditFormData((prev) => ({ ...prev, [name]: value }));
	};

	const resetAddForm = () => {
		setAddFormData({
			firstName: "",
			lastName: "",
			email: "",
			phoneNumber: "",
			department: "",
			position: "",
			joinDate: "",
			contractType: "PERMANENT",
			salary: "",
			qualification: "",
			experience: "",
		});
	};

	const handleAddStaff = async (event) => {
		event.preventDefault();

		const firstName = addFormData.firstName.trim();
		const lastName = addFormData.lastName.trim();
		const email = addFormData.email.trim();
		const phoneNumber = addFormData.phoneNumber.trim();
		const department = addFormData.department.trim();
		const position = addFormData.position.trim();

		if (!firstName || !lastName || !email || !department || !position) {
			setAddError("Please fill in all required fields.");
			return;
		}

		try {
			const response = await axiosInstance.post('/staff', {
				firstName,
				lastName,
				email,
				phoneNumber,
				department,
				position,
				joinDate: addFormData.joinDate,
				contractType: addFormData.contractType,
				salary: addFormData.salary ? parseFloat(addFormData.salary) : null,
				qualification: addFormData.qualification,
				experience: addFormData.experience ? parseInt(addFormData.experience) : null,
			});

			const savedStaff = response.data.data;
			setStaff((prev) => [savedStaff, ...prev]);
			setRecentAddedStaff((prev) => prev + 1);
			setMessage({ type: "success", text: "Staff member added successfully" });
			resetAddForm();
			closeAddModal();
		} catch (err) {
			setAddError("Failed to add staff: " + (err.response?.data?.message || err.message));
		}
	};

	const openViewModal = (staffMember) => {
		setViewStaff(staffMember);
	};

	const closeViewModal = () => {
		setViewStaff(null);
	};

	const openEditModal = (staffMember) => {
		setEditError("");
		setEditFormData({
			id: staffMember.id,
			staffId: staffMember.staffId || "",
			firstName: staffMember.firstName || "",
			lastName: staffMember.lastName || "",
			email: staffMember.email || "",
			phoneNumber: staffMember.phoneNumber || "",
			department: staffMember.department || "",
			position: staffMember.position || "",
			status: staffMember.status || "ACTIVE",
			joinDate: staffMember.joinDate || "",
			contractType: staffMember.contractType || "PERMANENT",
			salary: staffMember.salary || "",
			qualification: staffMember.qualification || "",
			experience: staffMember.experience || "",
		});
		setIsEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditError("");
		setIsEditModalOpen(false);
	};

	const handleSaveEdit = async (event) => {
		event.preventDefault();

		const firstName = editFormData.firstName.trim();
		const lastName = editFormData.lastName.trim();
		const email = editFormData.email.trim();
		const department = editFormData.department.trim();
		const position = editFormData.position.trim();

		if (!firstName || !lastName || !email || !department || !position) {
			setEditError("Please fill in all required fields.");
			return;
		}

		try {
			const response = await axiosInstance.put(`/staff/${editFormData.id}`, {
				firstName,
				lastName,
				email,
				phoneNumber: editFormData.phoneNumber,
				department,
				position,
				status: editFormData.status,
				joinDate: editFormData.joinDate,
				contractType: editFormData.contractType,
				salary: editFormData.salary ? parseFloat(editFormData.salary) : null,
				qualification: editFormData.qualification,
				experience: editFormData.experience ? parseInt(editFormData.experience) : null,
			});

			const updatedStaff = response.data.data;
			setStaff((prev) =>
				prev.map((s) =>
					s.id === editFormData.id ? updatedStaff : s
				)
			);
			setMessage({ type: "success", text: "Staff member updated successfully" });
			closeEditModal();
		} catch (err) {
			setEditError("Failed to update staff: " + (err.response?.data?.message || err.message));
		}
	};

	const handleToggleStatus = async () => {
		if (!selectedStaffForStatus) return;
		
		try {
			const newStatus = selectedStaffForStatus.status !== "ACTIVE" ? "ACTIVE" : "INACTIVE";
			await axiosInstance.put(`/staff/${selectedStaffForStatus.id}/status`, { status: newStatus });
			
			setStaff((prev) =>
				prev.map((s) =>
					s.id === selectedStaffForStatus.id ? { ...s, status: newStatus } : s
				)
			);
			setMessage({ type: "success", text: `Staff ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully` });
			setIsStatusModalOpen(false);
			setSelectedStaffForStatus(null);
		} catch (err) {
			setMessage({ type: "error", text: "Failed to update staff status: " + (err.response?.data?.message || err.message) });
		}
	};

	const getStatusBadgeClass = (status) => {
		switch (status) {
			case "ACTIVE": return "bg-success";
			case "ON_LEAVE": return "bg-warning";
			case "SUSPENDED": return "bg-danger";
			case "TERMINATED": return "bg-secondary";
			default: return "bg-primary";
		}
	};

	const getContractBadgeClass = (type) => {
		switch (type) {
			case "PERMANENT": return "bg-primary";
			case "CONTRACT": return "bg-info";
			case "TEMPORARY": return "bg-warning";
			case "PART_TIME": return "bg-secondary";
			case "INTERNSHIP": return "bg-dark";
			default: return "bg-light text-dark";
		}
	};

	return (
		<div className="users-page">
			{message.text && (
				<div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`} role="alert">
					{message.text}
					<button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
				</div>
			)}

			<div className="users-header">
				<h2>Staff Management</h2>
				<div className="users-header-actions">
					<button type="button" className="add-user-btn" onClick={openAddModal}>Add Staff</button>
				</div>
			</div>

			<section className="users-summary-cards" aria-label="Staff summary cards">
				<article className="users-summary-card users-summary-total">
					<i className="fa-solid fa-users users-summary-icon" aria-hidden="true"></i>
					<p>Total Staff</p>
					<h3>{totalStaff}</h3>
				</article>

				<article className="users-summary-card users-summary-recent">
					<i className="fa-solid fa-user-plus users-summary-icon" aria-hidden="true"></i>
					<p>Recent Added</p>
					<h3>{recentAddedStaff}</h3>
				</article>

				<article className="users-summary-card users-summary-active">
					<i className="fa-solid fa-user-check users-summary-icon" aria-hidden="true"></i>
					<p>Active Staff</p>
					<h3>{activeStaff}</h3>
				</article>

				<article className="users-summary-card users-summary-alerts">
					<i className="fa-solid fa-shield-halved users-summary-icon" aria-hidden="true"></i>
					<p>On Leave/Terminated</p>
					<h3>{onLeaveStaff + terminatedStaff}</h3>
				</article>
			</section>

			{isAddModalOpen && (
				<div className="users-modal-overlay" onClick={closeAddModal}>
					<div className="users-modal-content" onClick={(event) => event.stopPropagation()}>
						<div className="users-modal-header">
							<h3>Add Staff Member</h3>
							<button type="button" className="users-modal-close" onClick={closeAddModal}>x</button>
						</div>

						<form className="users-form" onSubmit={handleAddStaff}>
							{addError ? <p className="users-form-error">{addError}</p> : null}

							<div className="users-form-grid">
								<div className="users-form-field">
									<label htmlFor="firstName">First Name</label>
									<input
										type="text"
										id="firstName"
										name="firstName"
										value={addFormData.firstName}
										onChange={handleAddInputChange}
										placeholder="Enter first name"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="lastName">Last Name</label>
									<input
										type="text"
										id="lastName"
										name="lastName"
										value={addFormData.lastName}
										onChange={handleAddInputChange}
										placeholder="Enter last name"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="email">Email</label>
									<input
										type="email"
										id="email"
										name="email"
										value={addFormData.email}
										onChange={handleAddInputChange}
										placeholder="Enter email"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="phoneNumber">Phone Number</label>
									<input
										type="tel"
										id="phoneNumber"
										name="phoneNumber"
										value={addFormData.phoneNumber}
										onChange={handleAddInputChange}
										placeholder="e.g. +256700123456"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="department">Department</label>
									<select
										id="department"
										name="department"
										value={addFormData.department}
										onChange={handleAddInputChange}
									>
										<option value="">Select Department</option>
										{departments.map((dept) => (
											<option key={dept} value={dept}>{dept}</option>
										))}
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="position">Position</label>
									<input
										type="text"
										id="position"
										name="position"
										value={addFormData.position}
										onChange={handleAddInputChange}
										placeholder="Enter position"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="joinDate">Join Date</label>
									<input
										type="date"
										id="joinDate"
										name="joinDate"
										value={addFormData.joinDate}
										onChange={handleAddInputChange}
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="contractType">Contract Type</label>
									<select
										id="contractType"
										name="contractType"
										value={addFormData.contractType}
										onChange={handleAddInputChange}
									>
										<option value="PERMANENT">Permanent</option>
										<option value="TEMPORARY">Temporary</option>
										<option value="CONTRACT">Contract</option>
										<option value="PART_TIME">Part Time</option>
										<option value="INTERNSHIP">Internship</option>
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="salary">Salary (UGX)</label>
									<input
										type="number"
										id="salary"
										name="salary"
										value={addFormData.salary}
										onChange={handleAddInputChange}
										placeholder="Enter salary"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="qualification">Qualification</label>
									<input
										type="text"
										id="qualification"
										name="qualification"
										value={addFormData.qualification}
										onChange={handleAddInputChange}
										placeholder="e.g. Bachelor's Degree"
									/>
								</div>

								<div className="users-form-field">
									<label htmlFor="experience">Experience (years)</label>
									<input
										type="number"
										id="experience"
										name="experience"
										value={addFormData.experience}
										onChange={handleAddInputChange}
										placeholder="Enter years"
									/>
								</div>
							</div>

							<div className="users-form-actions">
								<button type="button" className="users-cancel-btn" onClick={closeAddModal}>Cancel</button>
								<button type="submit" className="users-save-btn">Save Staff</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{viewStaff && (
				<div className="users-modal-overlay" onClick={closeViewModal}>
					<div className="users-modal-content" onClick={(event) => event.stopPropagation()}>
						<div className="users-modal-header">
							<h3>Staff Profile</h3>
							<button type="button" className="users-modal-close" onClick={closeViewModal}>x</button>
						</div>

						<div className="users-details-grid">
							<p><strong>Staff ID:</strong> {viewStaff.staffId}</p>
							<p><strong>Full Name:</strong> {viewStaff.fullName || `${viewStaff.firstName} ${viewStaff.lastName}`}</p>
							<p><strong>Email:</strong> {viewStaff.email}</p>
							<p><strong>Phone:</strong> {viewStaff.phoneNumber}</p>
							<p><strong>Department:</strong> {viewStaff.department}</p>
							<p><strong>Position:</strong> {viewStaff.position}</p>
							<p><strong>Status:</strong> 
								<span className={`badge ${getStatusBadgeClass(viewStaff.status)} ms-2`}>
									{viewStaff.status}
								</span>
							</p>
							<p><strong>Join Date:</strong> {viewStaff.joinDate}</p>
							<p><strong>Contract Type:</strong> 
								<span className={`badge ${getContractBadgeClass(viewStaff.contractType)} ms-2`}>
									{viewStaff.contractType}
								</span>
							</p>
							<p><strong>Salary:</strong> {viewStaff.salary ? `${viewStaff.salary.toLocaleString()} UGX` : 'N/A'}</p>
							<p><strong>Qualification:</strong> {viewStaff.qualification || 'N/A'}</p>
							<p><strong>Experience:</strong> {viewStaff.experience ? `${viewStaff.experience} years` : 'N/A'}</p>
						</div>
					</div>
				</div>
			)}

			{isStatusModalOpen && selectedStaffForStatus && (
				<div className="users-modal-overlay" onClick={() => setIsStatusModalOpen(false)}>
					<div className="users-modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="users-modal-header">
							<h3>{selectedStaffForStatus.status === "ACTIVE" ? "Deactivate" : "Activate"} Staff</h3>
							<button type="button" className="users-modal-close" onClick={() => setIsStatusModalOpen(false)}>x</button>
						</div>
						<p style={{ fontSize: '15px', color: '#1f2937' }}>
							Are you sure you want to <strong>{selectedStaffForStatus.status === "ACTIVE" ? "deactivate" : "activate"}</strong> <strong>{selectedStaffForStatus.firstName} {selectedStaffForStatus.lastName}</strong> ({selectedStaffForStatus.staffId})?
						</p>
						<p style={{ fontSize: '13px', color: '#666' }}>
							{selectedStaffForStatus.status === "ACTIVE" ? "Deactivated" : "Activated"} staff will not be able to log in, but their records will be preserved.
						</p>
						<div className="users-form-actions" style={{ marginTop: '15px' }}>
							<button type="button" className="users-cancel-btn" onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
							<button type="button" className="users-save-btn" onClick={handleToggleStatus}>{selectedStaffForStatus.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
						</div>
					</div>
				</div>
			)}

			{isEditModalOpen && editFormData && (
				<div className="users-modal-overlay" onClick={closeEditModal}>
					<div className="users-modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="users-modal-header">
							<h3>Edit Staff Member</h3>
							<button type="button" className="users-modal-close" onClick={closeEditModal}>x</button>
						</div>

						<form className="users-form" onSubmit={handleSaveEdit}>
							{editError ? <p className="users-form-error">{editError}</p> : null}

							<div className="users-form-grid">
								<div className="users-form-field">
									<label htmlFor="editStaffId">Staff ID</label>
									<input type="text" id="editStaffId" value={editFormData.staffId} readOnly className="users-readonly-input" />
								</div>

								<div className="users-form-field">
									<label htmlFor="editFirstName">First Name</label>
									<input type="text" id="editFirstName" name="firstName" value={editFormData.firstName} onChange={handleEditInputChange} />
								</div>

								<div className="users-form-field">
									<label htmlFor="editLastName">Last Name</label>
									<input type="text" id="editLastName" name="lastName" value={editFormData.lastName} onChange={handleEditInputChange} />
								</div>

								<div className="users-form-field">
									<label htmlFor="editEmail">Email</label>
									<input type="email" id="editEmail" name="email" value={editFormData.email} onChange={handleEditInputChange} />
								</div>

								<div className="users-form-field">
									<label htmlFor="editPhoneNumber">Phone Number</label>
									<input type="tel" id="editPhoneNumber" name="phoneNumber" value={editFormData.phoneNumber} onChange={handleEditInputChange} />
								</div>

								<div className="users-form-field">
									<label htmlFor="editDepartment">Department</label>
									<select id="editDepartment" name="department" value={editFormData.department} onChange={handleEditInputChange}>
										<option value="">Select Department</option>
										{departments.map((dept) => (
											<option key={dept} value={dept}>{dept}</option>
										))}
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="editPosition">Position</label>
									<input type="text" id="editPosition" name="position" value={editFormData.position} onChange={handleEditInputChange} />
								</div>

								<div className="users-form-field">
									<label htmlFor="editStatus">Status</label>
									<select id="editStatus" name="status" value={editFormData.status} onChange={handleEditInputChange}>
										<option value="ACTIVE">Active</option>
										<option value="INACTIVE">Inactive</option>
										<option value="ON_LEAVE">On Leave</option>
										<option value="SUSPENDED">Suspended</option>
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="editJoinDate">Join Date</label>
									<input type="date" id="editJoinDate" name="joinDate" value={editFormData.joinDate} onChange={handleEditInputChange} />
								</div>

								<div className="users-form-field">
									<label htmlFor="editContractType">Contract Type</label>
									<select id="editContractType" name="contractType" value={editFormData.contractType} onChange={handleEditInputChange}>
										<option value="PERMANENT">Permanent</option>
										<option value="TEMPORARY">Temporary</option>
										<option value="CONTRACT">Contract</option>
										<option value="PART_TIME">Part Time</option>
										<option value="INTERNSHIP">Internship</option>
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="editSalary">Salary (UGX)</label>
									<input type="number" id="editSalary" name="salary" value={editFormData.salary} onChange={handleEditInputChange} placeholder="Enter salary" />
								</div>

								<div className="users-form-field">
									<label htmlFor="editQualification">Qualification</label>
									<input type="text" id="editQualification" name="qualification" value={editFormData.qualification} onChange={handleEditInputChange} placeholder="e.g. Bachelor's Degree" />
								</div>

								<div className="users-form-field">
									<label htmlFor="editExperience">Experience (years)</label>
									<input type="number" id="editExperience" name="experience" value={editFormData.experience} onChange={handleEditInputChange} placeholder="Enter years" />
								</div>
							</div>

							<div className="users-form-actions">
								<button type="button" className="users-cancel-btn" onClick={closeEditModal}>Cancel</button>
								<button type="submit" className="users-save-btn">Save Changes</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<div className="users-filter-bar">
				<div className="users-filter-group">
					<label htmlFor="usersFilter">Filter</label>
					<select
						id="usersFilter"
						value={filterField}
						onChange={(event) => setFilterField(event.target.value)}
					>
						<option value="all">All fields</option>
						<option value="id">By Staff ID</option>
						<option value="name">By name</option>
						<option value="email">By email</option>
						<option value="department">By department</option>
					</select>
				</div>

				<div className="users-filter-group users-search-group">
					<label htmlFor="usersSearch">Search</label>
					<input
						type="text"
						id="usersSearch"
						placeholder="Search by name, email, ID or department"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
				</div>
			</div>

			<div className="users-table-wrapper">
				<table className="users-table">
					<thead>
						<tr>
							<th>Staff ID</th>
							<th>Name</th>
							<th>Email</th>
							<th>Department</th>
							<th>Position</th>
							<th>Status</th>
							<th>Contract</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredStaff.map((s) => (
							<tr key={s.id}>
								<td>{s.staffId}</td>
								<td>{s.fullName || `${s.firstName} ${s.lastName}`}</td>
								<td>{s.email}</td>
								<td>{s.department}</td>
								<td>{s.position}</td>
								<td>
									<span className={`badge ${getStatusBadgeClass(s.status)}`}>
										{s.status}
									</span>
								</td>
								<td>
									<span className={`badge ${getContractBadgeClass(s.contractType)}`}>
										{s.contractType}
									</span>
								</td>
								<td>
									<div className="action-buttons">
										<button type="button" className="action-btn view-btn" onClick={() => openViewModal(s)}><i className="fa-solid fa-eye"></i></button>
										<button type="button" className="action-btn edit-btn" onClick={() => openEditModal(s)}><i className="fa-solid fa-pen-to-square"></i></button>
										<button type="button" className="action-btn delete-btn" onClick={() => { setSelectedStaffForStatus(s); setIsStatusModalOpen(true); }}><i className="fa-solid fa-toggle-off"></i></button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Staff;