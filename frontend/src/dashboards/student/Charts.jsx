// BarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = () => {
  // Define the chart data
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'monthly rate', // Label for the dataset
        data: [65, 59, 80, 81, 56, 55, 40], // The actual data points
        backgroundColor: [ // Array of colors for each bar
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderColor: [ // Array of border colors for each bar
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1, // Border width for the bars
      },
    ],
  };

  // Define the chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill the container size
    plugins: {
      legend: {
        position: 'top', // Position of the legend
      },
      title: {
        display: true,
        text: 'Study time Data', // Chart title
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Start the Y-axis at 0
        title: {
          display: true,
          text: 'Study time (hours)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  return (
    // Set a container for consistent sizing in React
   <div style={{width:"100%",height:"450px",boxShadow:"0 0 5px gray",marginTop:"20px",borderRadius:"10px"}}>
     <div style={{ width: '100%', height: '400px', padding: '20px' }}>
      <Bar data={data} options={options} />
    </div>
   </div>
  );
};

export default Charts;
