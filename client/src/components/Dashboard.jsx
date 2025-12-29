import { useState, useEffect } from 'react';
import API from '../api';

// Placeholder for Parth's component if you don't have it yet
const AnalyticsTable = ({ data }) => {
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
};

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calls GET /api/employees
        const response = await API.get('/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div>
      <h1>Retail Dashboard</h1>
      {/* This sends the real data to the UI component */}
      <AnalyticsTable data={employees} />
    </div>
  );
}

export default Dashboard;