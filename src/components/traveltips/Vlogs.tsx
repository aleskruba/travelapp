import { BASE_URL } from '../../constants/config';
import { useCountryContext } from '../../context/countryContext';
import { useQuery} from '@tanstack/react-query';
import Vlog from './Vlog';
import ReactPaginate from 'react-paginate';
import { useState } from 'react';
import { useAuthContext } from '../../context/authContext';
import CreateVlog from './CreateVlog';
import { travelTipsConstants } from '../../constants/constantsTravelTips';
import { useLanguageContext } from '../../context/languageContext';

/* const ITEMS_PER_PAGE = 6; */

type Props = {
  openDivCreateVlog:boolean;
  setOpenDivCreateVlog: (value: boolean) => void;
};

function Vlogs({openDivCreateVlog,setOpenDivCreateVlog}:Props) {

  const { language} = useLanguageContext()
    const { chosenCountry } = useCountryContext();

    const [currentPage, setCurrentPage] = useState(0);


    const { user } = useAuthContext();

    const fetchVlogs = async () => { 
        const response = await fetch(`${BASE_URL}/vlogs/${chosenCountry}?page=${currentPage+1}`)
        if (!response.ok) {
    
          throw new Error('fetching data error'); 
          
        }
      
        return response.json()
      }
    
      const {data,isLoading} = useQuery({
             queryFn: fetchVlogs,
             queryKey: ["vlogs",chosenCountry,currentPage],
             
      })
    
    
  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="wrapper">

<div className='text-center text-blue-500'>
  {!user ? 
    'Pouze přihlášení uživatelé mohou vkládat Vlogy' : 
    (!openDivCreateVlog && 
      <>{travelTipsConstants.addVlog[language]} <span className="underline cursor-pointer text-blue-600" onClick={() => setOpenDivCreateVlog(true)}>{travelTipsConstants.here[language]}</span></>
    )
  }
</div>

  {openDivCreateVlog &&
  <div className='flex justify-center'>
    <CreateVlog setOpenDivCreateVlog={setOpenDivCreateVlog}/>
  </div>
}

    {!isLoading ? 
            <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20">
                {

        data.vlogs.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id).map((vlog:any,idx:number)=>{
                
                return(
                    <Vlog    key={vlog.id}
                            vlog={vlog}

                    />
                    )
                    })

}
  </div> : <div className='flex justify-center items-center '> {travelTipsConstants.momentPlease[language]} </div> 
  }
{data?.vlogs.length > 10 && 
<ReactPaginate
        previousLabel={'←'}
        nextLabel={'→'}
        disabledClassName={'disabled'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={data?.totalPages || 0}
        marginPagesDisplayed={2}
        pageRangeDisplayed={8}
        onPageChange={handlePageChange}
        containerClassName={'pagination flex justify-center mt-8'}
        pageClassName={'page-item'}
        pageLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
        previousClassName={'page-item'}
        previousLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
        nextClassName={'page-item'}
        nextLinkClassName={'page-link px-4 py-2 border border-gray-300 rounded-md hover:bg-blue-100'}
        activeClassName={'active bg-blue-500 text-white'}
      />
}
</div>
  )
}

export default Vlogs