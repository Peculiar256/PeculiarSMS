import React from "react";

function ClassOverviewCards({ metrics }) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="class-card total-card h-100">
          <i
            className="fa-solid fa-layer-group class-icon"
            style={{
              border: "1px solid #2563eb",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              fontSize: "15px",
              display: "grid",
              placeItems: "center",
              color: "#2563eb",
              marginBottom: "5px",
            }}
            aria-hidden="true"
          ></i>
          <h3>Total Classes</h3>
          <h2>{metrics.totalClasses}</h2>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="class-card students-card h-100">
          <i
            className="fa-solid fa-users class-icon"
            style={{
              border: "1px solid #16a34a",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              fontSize: "15px",
              display: "grid",
              placeItems: "center",
              color: "#16a34a",
              marginBottom: "5px",
            }}
            aria-hidden="true"
          ></i>
          <h3>Total Students</h3>
          <h2>{metrics.totalStudents}</h2>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="class-card attendance-card h-100">
          <i
            className="fa-solid fa-chart-pie class-icon"
            style={{
              border: "1px solid #f59e0b",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              fontSize: "15px",
              display: "grid",
              placeItems: "center",
              color: "#f59e0b",
              marginBottom: "5px",
            }}
            aria-hidden="true"
          ></i>
          <h3>Avg Attendance</h3>
          <h2>{metrics.avgAttendance}%</h2>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="class-card performance-card h-100">
          <i
            className="fa-solid fa-star class-icon"
            style={{
              border: "1px solid #8b5cf6",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              fontSize: "15px",
              display: "grid",
              placeItems: "center",
              color: "#8b5cf6",
              marginBottom: "5px",
            }}
            aria-hidden="true"
          ></i>
          <h3>Avg Performance</h3>
          <h2>{metrics.avgPerformance}</h2>
        </div>
      </div>
    </div>
  );
}

export default ClassOverviewCards;
