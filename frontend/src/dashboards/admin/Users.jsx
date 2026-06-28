import React, { useMemo, useState } from "react";
import "./Users.css";

const sampleUsers = [
	{ id: 1, userId: "USR001", firstName: "Amina", lastName: "Nansubuga", email: "amina.n@school.com", role: "Student", status: "Active", dateJoined: "2025-01-12" },
	{ id: 2, userId: "USR002", firstName: "Brian", lastName: "Okello", email: "brian.o@school.com", role: "Student", status: "Active", dateJoined: "2025-01-14" },
	{ id: 3, userId: "USR003", firstName: "Carol", lastName: "Atim", email: "carol.a@school.com", role: "Student", status: "Inactive", dateJoined: "2025-01-18" },
	{ id: 4, userId: "USR004", firstName: "David", lastName: "Tumwesigye", email: "david.t@school.com", role: "Teacher", status: "Active", dateJoined: "2025-01-20" },
	{ id: 5, userId: "USR005", firstName: "Evelyn", lastName: "Nakirya", email: "evelyn.n@school.com", role: "Student", status: "Active", dateJoined: "2025-01-22" }
];

function Users() {
	const [users, setUsers] = useState(sampleUsers);
	const [filterField, setFilterField] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [addError, setAddError] = useState("");
	const [recentAddedUsers, setRecentAddedUsers] = useState(0);
	const [viewUser, setViewUser] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editError, setEditError] = useState("");
	const [addFormData, setAddFormData] = useState({
		userId: "",
		firstName: "",
		lastName: "",
		email: "",
		role: "Student",
		status: "Active",
		dateJoined: "",
	});
	const [editFormData, setEditFormData] = useState({
		id: null,
		userId: "",
		firstName: "",
		lastName: "",
		email: "",
		role: "Student",
		status: "Active",
		dateJoined: "",
	});

	const filteredUsers = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();

		if (!normalizedTerm) {
			return users;
		}

		return users.filter((user) => {
			const idText = user.userId.toLowerCase();
			const nameText = `${user.firstName} ${user.lastName}`.toLowerCase();
			const emailText = user.email.toLowerCase();

			if (filterField === "id") {
				return idText.includes(normalizedTerm);
			}

			if (filterField === "name") {
				return nameText.includes(normalizedTerm);
			}

			if (filterField === "email") {
				return emailText.includes(normalizedTerm);
			}

			return (
				idText.includes(normalizedTerm) ||
				nameText.includes(normalizedTerm) ||
				emailText.includes(normalizedTerm)
			);
		});
	}, [filterField, searchTerm, users]);

	const totalUsers = users.length;
	const activeUsers = useMemo(
		() => users.filter((user) => user.status === "Active").length,
		[users]
	);
	const securityAlerts = useMemo(
		() => users.filter((user) => user.status === "Inactive").length,
		[users]
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
			userId: "",
			firstName: "",
			lastName: "",
			email: "",
			role: "Student",
			status: "Active",
			dateJoined: "",
		});
	};

	const handleAddUser = (event) => {
		event.preventDefault();

		const userId = addFormData.userId.trim().toUpperCase();
		const firstName = addFormData.firstName.trim();
		const lastName = addFormData.lastName.trim();
		const email = addFormData.email.trim();
		const role = addFormData.role;
		const status = addFormData.status;
		const dateJoined = addFormData.dateJoined;

		if (!userId || !firstName || !lastName || !email || !role || !status || !dateJoined) {
			setAddError("Please fill in all fields.");
			return;
		}

		const userIdExists = users.some((user) => user.userId.toLowerCase() === userId.toLowerCase());
		if (userIdExists) {
			setAddError("User ID already exists. Please use a unique User ID.");
			return;
		}

		const newUser = {
			id: users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1,
			userId,
			firstName,
			lastName,
			email,
			role,
			status,
			dateJoined,
		};

		setUsers((prev) => [newUser, ...prev]);
		setRecentAddedUsers((prev) => prev + 1);
		resetAddForm();
		closeAddModal();
	};

	const openViewModal = (user) => {
		setViewUser(user);
	};

	const closeViewModal = () => {
		setViewUser(null);
	};

	const openEditModal = (user) => {
		setEditError("");
		setEditFormData({
			id: user.id,
			userId: user.userId,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			status: user.status,
			dateJoined: user.dateJoined,
		});
		setIsEditModalOpen(true);
	};

	const closeEditModal = () => {
		setEditError("");
		setIsEditModalOpen(false);
	};

	const handleSaveEdit = (event) => {
		event.preventDefault();

		const firstName = editFormData.firstName.trim();
		const lastName = editFormData.lastName.trim();
		const email = editFormData.email.trim();
		const role = editFormData.role;
		const status = editFormData.status;
		const dateJoined = editFormData.dateJoined;

		if (!firstName || !lastName || !email || !role || !status || !dateJoined) {
			setEditError("Please fill in all fields.");
			return;
		}

		setUsers((prev) =>
			prev.map((user) =>
				user.id === editFormData.id
					? {
						...user,
						firstName,
						lastName,
						email,
						role,
						status,
						dateJoined,
					}
					: user
			)
		);

		closeEditModal();
	};

	const handleSuspendUser = (userId) => {
		setUsers((prev) =>
			prev.map((user) =>
				user.id === userId
					? {
						...user,
						status: "Inactive",
					}
					: user
			)
		);
	};

	const handleDeleteUser = (userId) => {
		setUsers((prev) => prev.filter((user) => user.id !== userId));
	};

	return (
		<div className="users-page">
			<div className="users-header">
				<h2>Staff Management</h2>
				<div className="users-header-actions">
					<button type="button" className="add-user-btn" onClick={openAddModal}>Add User</button>
				</div>
			</div>

			<section className="users-summary-cards" aria-label="Users summary cards">
				<article className="users-summary-card users-summary-total">
					<i className="fa-solid fa-users users-summary-icon" aria-hidden="true"></i>
					<p>Total Staff</p>
					<h3>{totalUsers}</h3>
				</article>

				<article className="users-summary-card users-summary-recent">
					<i className="fa-solid fa-user-plus users-summary-icon" aria-hidden="true"></i>
					<p>Recent Added Staff</p>
					<h3>{recentAddedUsers}</h3>
				</article>

				<article className="users-summary-card users-summary-active">
					<i className="fa-solid fa-user-check users-summary-icon" aria-hidden="true"></i>
					<p>Active Staff</p>
					<h3>{activeUsers}</h3>
				</article>

				<article className="users-summary-card users-summary-alerts">
					<i className="fa-solid fa-shield-halved users-summary-icon" aria-hidden="true"></i>
					<p>Security Alerts</p>
					<h3>{securityAlerts}</h3>
				</article>
			</section>

			{isAddModalOpen && (
				<div className="users-modal-overlay" onClick={closeAddModal}>
					<div className="users-modal-content" onClick={(event) => event.stopPropagation()}>
						<div className="users-modal-header">
							<h3>Add Staff</h3>
							<button type="button" className="users-modal-close" onClick={closeAddModal}>x</button>
						</div>

						<form className="users-form" onSubmit={handleAddUser}>
							{addError ? <p className="users-form-error">{addError}</p> : null}

							<div className="users-form-grid">
								<div className="users-form-field">
									<label htmlFor="userId">User ID</label>
									<input
										type="text"
										id="userId"
										name="userId"
										value={addFormData.userId}
										onChange={handleAddInputChange}
										placeholder="e.g. USR008"
									/>
								</div>

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
									<label htmlFor="role">Role</label>
									<select
										id="role"
										name="role"
										value={addFormData.role}
										onChange={handleAddInputChange}
									>
										<option value="Student">Student</option>
										<option value="Teacher">Teacher</option>
										<option value="Admin">Admin</option>
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="status">Status</label>
									<select
										id="status"
										name="status"
										value={addFormData.status}
										onChange={handleAddInputChange}
									>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
									</select>
								</div>

								<div className="users-form-field users-form-field-full">
									<label htmlFor="dateJoined">Date Joined</label>
									<input
										type="date"
										id="dateJoined"
										name="dateJoined"
										value={addFormData.dateJoined}
										onChange={handleAddInputChange}
									/>
								</div>
							</div>

							<div className="users-form-actions">
								<button type="button" className="users-cancel-btn" onClick={closeAddModal}>Cancel</button>
								<button type="submit" className="users-save-btn">Save User</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{viewUser && (
				<div className="users-modal-overlay" onClick={closeViewModal}>
					<div className="users-modal-content" onClick={(event) => event.stopPropagation()}>
						<div className="users-modal-header">
							<h3>User Profile</h3>
							<button type="button" className="users-modal-close" onClick={closeViewModal}>x</button>
						</div>

						<div className="users-details-grid">
							<p><strong>User ID:</strong> {viewUser.userId}</p>
							<p><strong>First Name:</strong> {viewUser.firstName}</p>
							<p><strong>Last Name:</strong> {viewUser.lastName}</p>
							<p><strong>Email:</strong> {viewUser.email}</p>
							<p><strong>Role:</strong> {viewUser.role}</p>
							<p><strong>Status:</strong> {viewUser.status}</p>
							<p><strong>Date Joined:</strong> {viewUser.dateJoined}</p>
						</div>
					</div>
				</div>
			)}

			{isEditModalOpen && (
				<div className="users-modal-overlay" onClick={closeEditModal}>
					<div className="users-modal-content" onClick={(event) => event.stopPropagation()}>
						<div className="users-modal-header">
							<h3>Edit User</h3>
							<button type="button" className="users-modal-close" onClick={closeEditModal}>x</button>
						</div>

						<form className="users-form" onSubmit={handleSaveEdit}>
							{editError ? <p className="users-form-error">{editError}</p> : null}

							<div className="users-form-grid">
								<div className="users-form-field">
									<label htmlFor="editUserId">User ID</label>
									<input type="text" id="editUserId" value={editFormData.userId} readOnly className="users-readonly-input" />
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
									<label htmlFor="editRole">Role</label>
									<select id="editRole" name="role" value={editFormData.role} onChange={handleEditInputChange}>
										<option value="Student">Student</option>
										<option value="Teacher">Teacher</option>
										<option value="Admin">Admin</option>
									</select>
								</div>

								<div className="users-form-field">
									<label htmlFor="editStatus">Status</label>
									<select id="editStatus" name="status" value={editFormData.status} onChange={handleEditInputChange}>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
									</select>
								</div>

								<div className="users-form-field users-form-field-full">
									<label htmlFor="editDateJoined">Date Joined</label>
									<input type="date" id="editDateJoined" name="dateJoined" value={editFormData.dateJoined} onChange={handleEditInputChange} />
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
						<option value="name">By name</option>
						<option value="id">By id</option>
						<option value="email">By email</option>
					</select>
				</div>

				<div className="users-filter-group users-search-group">
					<label htmlFor="usersSearch">Search</label>
					<input
						type="text"
						id="usersSearch"
						placeholder="Search by name, email or user id"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
				</div>
			</div>

			<div className="users-table-wrapper">
				<table className="users-table">
					<thead>
						<tr>
							<th>UserID</th>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Status</th>
							<th>Date Joined</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map((user) => (
							<tr key={user.id}>
								<td>{user.userId}</td>
								<td>{user.firstName}</td>
								<td>{user.lastName}</td>
								<td>{user.email}</td>
								<td>
									<span className={`badge role-badge role-${user.role.toLowerCase()}`}>
										{user.role}
									</span>
								</td>
								<td>
									<span className={`badge status-badge status-${user.status.toLowerCase()}`}>
										{user.status}
									</span>
								</td>
								<td>{user.dateJoined}</td>
								<td>
									<div className="action-buttons">
										<button type="button" className="action-btn view-btn" onClick={() => openViewModal(user)}><i class="fa-solid fa-eye"></i></button>
										<button type="button" className="action-btn edit-btn" onClick={() => openEditModal(user)}><i class="fa-solid fa-pen-to-square"></i></button>
										{/* <button type="button" className="action-btn suspend-btn" onClick={() => handleSuspendUser(user.id)}><i class="fa-solid fa-power-off"></i></button> */}
										<button type="button" className="action-btn delete-btn" onClick={() => handleDeleteUser(user.id)}><i class="fa-solid fa-trash"></i></button>
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

export default Users;
