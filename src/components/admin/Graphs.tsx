import React, { useState } from 'react';
import { UserProps } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper function to create a full set of months
const getAllMonths = () => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return months;
};

type Props = {
  user: UserProps | null;
};

function Graphs({ user }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>('2024'); // Default to '2024'

  if (!user || !user.loginLogs) {
    return <div>No data available</div>;
  }

  // Define the types for the login log and the result structure
  interface LoginLog {
    failureReason: string | null;
    id: number;
    ipAddress: string;
    status: 'SUCCESS' | 'FAILURE';
    timestamp: string;
    user_id: number;
  }

  interface MonthlyStatus {
    success: number;
    error: number;
  }

  interface YearlyLoginStats {
    [year: string]: {
      [month: string]: MonthlyStatus;
    };
  }

  // Assuming user.loginLogs is an array of LoginLog
  const result: YearlyLoginStats = user.loginLogs.reduce<YearlyLoginStats>((acc, item) => {
    // Extract year and month from the timestamp
    const date = new Date(item.timestamp);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('en', { month: 'short' }).toLowerCase();

    // Initialize the year and month if they don't exist
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = { success: 0, error: 0 };
    }

    // Increment the success or failure count based on status
    if (item.status === "SUCCESS") {
      acc[year][month].success += 1;
    } else if (item.status === "FAILURE") {
      acc[year][month].error += 1;
    }

    return acc;
  }, {});

  // Extract all years from the result object
  const years = Object.keys(result);

  // Get all months in the selected year
  const monthsInYear = getAllMonths();

  // Prepare the data for the graph
  const data = monthsInYear.map((month) => {
    const monthLabel = month.toLowerCase();
    const success = result[selectedYear]?.[monthLabel]?.success || 0;
    const error = result[selectedYear]?.[monthLabel]?.error || 0;

    return {
      month,
      success,
      error,
    };
  });

  return (
    <div className='flex flex-col items-center pr-10'> 
      {/* Year Selection */}
      <div style={{ marginBottom: '20px' }}>
        <span>Select Year: </span>
        {years.map((year) => (
          <button
            key={year}
            style={{
                padding: '5px 10px',
              backgroundColor: selectedYear === year ? '#8884d8' : '#f0f0f0',
              border: '1px solid #ccc',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="success" stroke="#8884d8" />
            <Line type="monotone" dataKey="error" stroke="#ff0000" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Graphs;
