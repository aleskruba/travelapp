import React, { useEffect, useState } from 'react'
import Users from '../components/admin/Users'
import Logs from '../components/admin/Logs'
import UserRegistrationGraph from '../components/admin/UserRegistrationGraph'
import UserRegistrationStatisctics from '../components/admin/UserRegistrationStatisctics'
import { fetchData } from '../hooks/useFetchData'
import { BASE_URL } from '../constants/config'
import { UserProps } from '../types'

const AdminPage = () => {

  const [user, setUser] = useState<UserProps[] | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  const url = `${BASE_URL}/admin/registrationdata`;

  const fetchUser = async () => {
    try {
      const response = await fetchData(url, "GET");
      const data = await response.json();
      setTotalUsers(data.totalUser)
      setUser(data.users);
    } catch (err: any) {
      console.error(err);
      setBackendError(err ? err.message : "Něco se pokazilo");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  console.log(user)

  return (
<>
    <div className='flex justify-around pt-8 md:items-start items-center  flex-col md:flex-row'>


        <Users/>
     
        <Logs/>
    </div>

    <div className='flex justify-center items-center  pt-4 gap-12 flex-col mt-8 '>
    <UserRegistrationGraph users={user || []} />
    <UserRegistrationStatisctics totalUsers={totalUsers}/>
    </div>
    </>
  )
}

export default AdminPage