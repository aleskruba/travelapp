import React, { ChangeEvent } from 'react'

type DebounceProps = { 
    text: string,
    setText: React.Dispatch<React.SetStateAction<string>>
}


function SearchDebounceComponent({text, setText}:DebounceProps) {

const changeHandler = (e: ChangeEvent<HTMLInputElement>) =>{

    setText(e.target.value)

}

    return (
    <div className='w-full h-9.5 rounded   '>      
<input
  type="text"
  value={text}
  onChange={changeHandler}
  placeholder="Hledej zemi ... (debounce method)"
  className='w-full h-full px-2 border-1.5 rounded placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
/>
</div>
  )
}

export default SearchDebounceComponent