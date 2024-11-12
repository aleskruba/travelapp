import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../constants/config';
import { UserProps } from '../../types';
import { fetchData } from '../../hooks/useFetchData';
import { Link } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import useFetchUsers from '../../hooks/useFetchUsers';

type SearchProps = {
  userId:null | number |string,
  email:null | string ,
}

function Users() {

  const [text, setText] = useState<SearchProps>({ userId: null, email: null });
 const { debouncedValue,debounceLoading } = useDebounce(text, 1000);
 const { users, loading, error } = useFetchUsers(debouncedValue);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setText((prevState) => ({
      ...prevState,
      [name]: name === 'userId' ? (value ? Number(value) : null) : value,
    }));
  };

  const userDataFiltered = users.filter((user: any) => {
    const { userId, email } = debouncedValue;
  
    const userIdMatch = userId ? user.id === Number(userId) : true; 
    const emailMatch = email ? user.email.toLowerCase().includes(email.toLowerCase()) : true;
  
    return userIdMatch && emailMatch;
  });

  return (
    <div>
      <h1 className='text-center pb-8 '>Users</h1>
    
      <ul className="user-list border rounded-lg shadow-md bg-white p-4">


      <li className="flex space-x-4 mb-4">
    <input
      type="text"
      placeholder="Search by ID"
      name="userId"
      onChange={changeHandler}
      className="input-field w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
    />
    <input
      type="text"
      placeholder="Search by email"
      name="email"
      onChange={changeHandler}
      className="input-field w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
    />
  </li>   

  {debounceLoading && <p>Debouncing...</p>}
        {loading && <p>Loading...</p>}
        {!error && userDataFiltered.map((user: any) => (
              <Link to={`../admin/users/${user.id}`} key={user.id} className="user-link">
              <li className="user-item flex justify-between items-center py-2 border-b hover:bg-gray-100 transition duration-200">
                <span className="user-id font-medium text-gray-600">ID: {user.id}</span>
                <span className="user-email text-gray-800 pl-2">{user.email}</span>
              </li>
            </Link>
        ))}
   
</ul>
<h1>{(text.userId || text.email) &&  !userDataFiltered.length && !debounceLoading && !loading ? 'NO RECORD' : ''}</h1>
  {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default Users;
