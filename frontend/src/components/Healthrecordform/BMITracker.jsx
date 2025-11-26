import React, { useState, useEffect } from 'react';
import { api } from '../../axios.config';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BMITracker = () => {
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBMIHistory();
  }, []);

  const fetchBMIHistory = async () => {
    try {
      const response = await api.get('/health-record/student/bmi-history');
      setBmiHistory(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch BMI history');
      setLoading(false);
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const chartData = {
    labels: bmiHistory.map(record => new Date(record.date).toLocaleDateString()),
    datasets: [
      {
        label: 'BMI',
        data: bmiHistory.map(record => record.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'BMI Trend Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 15,
        max: 40,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-6">BMI Tracking</h2>
      
      {bmiHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No BMI records found. Add height and weight to your health records to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Latest BMI */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Latest BMI</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{bmiHistory[0]?.value}</p>
                <p className="text-sm text-gray-600">BMI</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{bmiHistory[0]?.height} cm</p>
                <p className="text-sm text-gray-600">Height</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{bmiHistory[0]?.weight} kg</p>
                <p className="text-sm text-gray-600">Weight</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-semibold ${getBMICategory(bmiHistory[0]?.value).color}`}>
                  {getBMICategory(bmiHistory[0]?.value).category}
                </p>
                <p className="text-sm text-gray-600">Category</p>
              </div>
            </div>
          </div>

          {/* BMI Chart */}
          {bmiHistory.length > 1 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">BMI Trend</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* BMI History Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">BMI History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Height (cm)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bmiHistory.map((record, index) => {
                    const categoryInfo = getBMICategory(record.value);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.height}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.weight}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.value}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${categoryInfo.color}`}>
                          {categoryInfo.category}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BMI Categories Reference */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">BMI Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
              <div className="text-blue-600">
                <span className="font-medium">Underweight:</span> &lt; 18.5
              </div>
              <div className="text-green-600">
                <span className="font-medium">Normal:</span> 18.5 - 24.9
              </div>
              <div className="text-yellow-600">
                <span className="font-medium">Overweight:</span> 25 - 29.9
              </div>
              <div className="text-red-600">
                <span className="font-medium">Obese:</span> ≥ 30
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMITracker;