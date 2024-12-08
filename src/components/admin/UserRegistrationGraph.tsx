import { Bar } from "react-chartjs-2";
import { Chart as ChartJs, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { UserProps } from "../../types";
import { useState, useEffect } from "react";

ChartJs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  users: UserProps[];
};

function UserRegistrationGraph({ users }: Props) {
  const currentYear = new Date().getFullYear(); // Get the current year

  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear); // Set default to current year
  const [registrationData, setRegistrationData] = useState<{ [key: string]: number[] }>({});

  // List of months for the bar chart x-axis
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  useEffect(() => {
    if (users.length > 0) {
      const registrationsByYear: { [key: number]: number[] } = {};

      users.forEach((user) => {
        // Check if registrationDate is not null
        if (user.registrationDate) {
          const registrationDate = new Date(user.registrationDate);  // Safe to call new Date() now
          const year = registrationDate.getFullYear();
          const month = registrationDate.getMonth();
          
          if (!registrationsByYear[year]) {
            registrationsByYear[year] = Array(12).fill(0); // Initialize array for all months (12 months)
          }

          registrationsByYear[year][month] += 1; // Increment the count for the respective month
        }
      });

      setRegistrationData(registrationsByYear); // Store the registration data by year
    }
  }, [users]);

  // Handle year selection
  const handleYearClick = (year: number) => {
    setSelectedYear(year); // Update selected year
  };

  // Prepare data for the bar chart
  const barChartData = {
    labels: monthNames, // X-axis labels (months)
    datasets: [
      {
        label: `User Registrations (${selectedYear})`, // Display the selected year
        data: selectedYear ? registrationData[selectedYear] : [], // Use selected year's data
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Let the width be controlled by the container
    plugins: {
      title: {
        display: true,
        text: 'User Registrations by Month',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw} registrations`,
        },
      },
    },
  };

  // Extract years from users' registration data
  const years = Array.from(
    new Set(
      users
        .filter(user => user.registrationDate !== null)
        .map(user => {
          const registrationDate = user.registrationDate ? new Date(user.registrationDate) : null;
          return registrationDate ? registrationDate.getFullYear() : undefined;
        })
        .filter((year): year is number => year !== undefined) // Filter out undefined values and assert the type
    )
  );

  return (
    <div className="flex flex-col items-center rounded-lg shadow-lg w-[90%] md:w-[80%]">
      {/* Year Buttons */}
      <div className="flex space-x-4 mb-4">
        {years.map((year) => (
          <button
            key={year}
            className={`px-4 py-2 rounded-md ${selectedYear === year ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => year !== undefined && handleYearClick(year)} // Ensure year is defined
          >
            {year}
          </button>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="w-full h-64">
        <Bar options={options} data={barChartData} />
      </div>
    </div>
  );
}

export default UserRegistrationGraph;
