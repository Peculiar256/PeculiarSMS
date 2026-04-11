import React from "react";
import './PieChart.css';
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function PieChart() {
  const data = {
    labels: ["Computer science ", "Social sciences", "Engineering", "Banking and Microfinance"],
    datasets: [
      {
        label: "Available books",
        data: [12, 19, 3, 5],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="pie-content">
      <div
      style={{
        width: "400px",   
        height: "300px",  
        margin:"50px"

      }}
    >
      <Pie data={data} options={options} />
    </div>
    </div>
  );
}

export default PieChart;
