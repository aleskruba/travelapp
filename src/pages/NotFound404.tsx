import React from 'react'


function NotFound404() {
  return (
    <div className='pt-10 pb-10 flex h-screen justify-center items-center flex-col gap-10 dark:text-white'>

<h1 className='text-3xl font-thin'>
  Uh-oh!
</h1>
<h2 className='text-3xl font-thin'>
  Může to být tebou, nebo námi, ale žádná stránka tu není.
</h2>
<h2 className='text-3xl font-thin'>
  Pravděpodobně jde o chybu 404. &nbsp;&nbsp; Znamená to, že stránka neexistuje.
</h2>

      <img src={process.env.PUBLIC_URL + '/emoji.png'} alt="" className='flex'/>


    </div>
  )
}

export default NotFound404