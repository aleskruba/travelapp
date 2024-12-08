import React from 'react'

type Props = {
    totalUsers : number | null;
}
function UserRegistrationStatisctics({totalUsers}:Props) {

    
  return (
     <div className="flex flex-col justify-center items-center p-6 rounded-lg shadow-lg min-w-48 ">
          <div>
          Total Users 
         </div>
          <div className='text-3xl font-extrabold'>
        {totalUsers}
        </div>
    </div>
  )
}

export default UserRegistrationStatisctics