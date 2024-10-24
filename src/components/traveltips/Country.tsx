
import { useCountryContext } from '../../context/countryContext';
import { motion } from "framer-motion"

function Country() {
    
    const {chosenCountryData,chosenCountry} = useCountryContext();


  return (
    <div className='dark:text-lighTextColor pt-4 py-2 md:py-4'>
      {chosenCountryData && chosenCountry ? <>
        <div>
        <div className='flex justify-around items-center '>
          <div className=' text-2xl font-extrabold'>{chosenCountryData?.name}</div>
          <div> <img src={chosenCountryData?.flag} className='w-[50px] h-auto' alt="" /></div>
        </div>
        <div className='flex flex-col md:flex-row pt-4 '>

        <div className='flex md:flex-1 flex-col justify-center items-center'>
             <div className='flex justify-between w-full md:w-1/2 px-4'>
                <div>continent </div>
                <div>{chosenCountryData?.continent}</div>
             </div>
             <div className='flex justify-between w-full md:w-1/2 px-4'>
                <div>hlavní město </div>
                <div>{chosenCountryData?.capital}</div>
             </div>
    
          </div>
          
          <div className='flex md:flex-1 flex-col justify-center items-center '>
            <div className='flex justify-between w-full md:w-1/2 px-4'>
              <div>počet obyvatel</div>
              <div>{chosenCountryData?.population}</div>
            </div>
            <div className='flex justify-between w-full md:w-1/2 px-4'>
              <div>area</div>
              <div>{chosenCountryData?.area}</div>
           </div>
           <div className='flex justify-between w-full md:w-1/2 px-4'>
              <div>jazyk</div>
              <div>{chosenCountryData?.language}</div>
            </div>
           <div className='flex justify-between w-full md:w-1/2 px-4'>
              <div>měna</div>
              <div>{chosenCountryData?.currency}</div>
            </div>
          </div>


      
        </div>
        </div>
       </> :<>
       <div className='flex flex-col md:flex-row items-center justify-center pb-24 h-screen '>

        <div className=' transform rotate-90 md:block md:transform md:rotate-0'>
       <motion.div
        animate={{ x: [-10, 10, -10, 10, 0], rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 0.3 }}
        >
      <img src="/arrow.png" alt="" className='w-[60%] h-auto md:hidden' />
      </motion.div>
      </div>


        <div className='flex flex-col items-center justify-center '>
          <h1 className='text-3xl md:text-6xl poppins-extrabold-italic'>
          Vyber stát
          </h1>
          <h1 className='text-base md:text-2xl poppins-extrabold-italic mt-4 '>
          {!chosenCountryData && 'TATO ZEMĚ NEMÁ ULOŽENÉ ŽÁDNÉ DATA, OSTUDA...'}
          </h1>
        </div>
 
        
       </div>
       </>}
</div>
  )
}

export default Country