import { useEffect, useState } from 'react';
import { fetchData } from './useFetchData';
import { BASE_URL } from '../constants/config';

type SearchProps = {
  userId: number | string | null;
  email: string | null;
};

const useFetchUsers = (searchParams: SearchProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { userId, email } = searchParams;

    // Construct query string based on non-null parameters
    const params = new URLSearchParams();
    if (userId) params.append('userId', String(userId));
    if (email) params.append('email', email);

    const fetchUsers = async () => {
      if (userId || email) {  // Fetch only if there's a search parameter
        setLoading(true);
        setError(null);
        try {
          const response = await fetchData(`${BASE_URL}/admin/getusers?${params.toString()}`, 'GET');
          const data = await response.json();

          setUsers(data.users);
        } catch (err) {
          setError('Failed to fetch users');
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]); // Clear users if no search parameters
      }
    };

    fetchUsers();
  }, [searchParams]);

  return { users, loading, error };
};

export default useFetchUsers;
