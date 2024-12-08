import React, { useEffect, useState } from 'react';
import { fetchData } from '../../hooks/useFetchData';
import { BASE_URL } from '../../constants/config';

interface SuspiciousLog {
  userId: number;
  failureCount: number;
}

function Logs() {
  const [loginData, setLoginData] = useState<SuspiciousLog[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);

  const url = `${BASE_URL}/admin/logindata`;

  const fetchUser = async () => {
    try {
      const response = await fetchData(url, 'GET');
      const data = await response.json();
      setLoginData(data.suspiciousArray);
    } catch (err: any) {
      console.error(err);
      setBackendError(err ? err.message : 'Něco se pokazilo');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="px-8  w-[380px] pt-8 md:pt-0 rounded-lg shadow-lg ">
      <h2 className="text-2xl font-bold mb-6 leading-none">Suspicious Logs       <span className="text-xs font-bold mb-6 ">In two last months </span></h2>

      {backendError && (
        <div className="text-red-500 bg-red-100 p-4 rounded-lg mb-4">
          {backendError}
        </div>
      )}

      {loginData.length === 0 ? (
        <p>No suspicious login attempts found.</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium  bg-green-500  rounded-tl-lg">
                User ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium  bg-green-500  rounded-tr-lg">
                Failure Count
              </th>
            </tr>
          </thead>
          <tbody>
            {loginData.map((log, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 even:bg-gray-50 transition duration-200"
              >
                <td className="px-6 py-4 text-sm text-gray-900">{log.userId}</td>
                <td className="px-6 py-4 text-sm text-red-800 font-bold">{log.failureCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Logs;
