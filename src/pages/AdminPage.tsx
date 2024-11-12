import React from 'react'
import Users from '../components/admin/Users'
import Logs from '../components/admin/Logs'

const AdminPage = () => {
  return (
    <div className='flex justify-around min-h-screen pt-4 flex-col md:flex-row'>
        <Users/>
        <Logs/>
    </div>
  )
}

export default AdminPage