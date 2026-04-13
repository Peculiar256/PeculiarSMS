import React from "react";

function ClassListTable({
  paginatedClasses,
  totalPages,
  currentPage,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  filterSection,
  setFilterSection,
  filterTeacher,
  setFilterTeacher,
  uniqueSections,
  sampleTeachers,
  setSelectedClass,
  openEditModal,
  handleDeleteClass,
}) {
  return (
    <div className="card">
      <div className="card-body">
        <h2 className="mb-4 fs-5">Classes Overview</h2>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="class-search-wrapper">
              <input
                type="text"
                className="form-control"
                placeholder="Search class or teacher"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <select
              className="form-select"
              value={filterSection}
              onChange={(e) => {
                setFilterSection(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Sections</option>
              {uniqueSections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <select
              className="form-select"
              value={filterTeacher}
              onChange={(e) => {
                setFilterTeacher(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Teachers</option>
              {sampleTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Class Name</th>
                <th>Section</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Attendance</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClasses.length > 0 ? (
                paginatedClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td className="fw-bold">{cls.name}</td>
                    <td>{cls.section}</td>
                    <td>{cls.teacher}</td>
                    <td>{cls.students}</td>
                    <td>
                      <span className="badge bg-success">{cls.attendance}%</span>
                    </td>
                    <td>
                      <span className="badge bg-info">{cls.performance}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => setSelectedClass(cls)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEditModal(cls)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClass(cls.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No classes found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4" aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

export default ClassListTable;
