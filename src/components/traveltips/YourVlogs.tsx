import { BASE_URL } from '../../constants/config';
import { useQuery} from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';
import { useState } from 'react';
import YourVlog from './YourVlog';
import Image from '../../custom/Image';
import fun from '../../assets/images/fun.png';
import { Link } from 'react-router-dom';

/* const ITEMS_PER_PAGE = 6;
 */

function YourVlogs() {
    const [currentPage, setCurrentPage] = useState(0);


    const fetchYourVlogs = async () => { 
        const response = await fetch(`${BASE_URL}/yourvlogs?page=${currentPage+1}`, {
            credentials: 'include', // Include cookies in the request
          })

        if (!response.ok) {
    
          throw new Error('Chyba při získaní dat'); 
          
        }
      
        return response.json()
      }
    
      const {data,isLoading} = useQuery({
             queryFn: fetchYourVlogs,
             queryKey: ["yourvlogs",currentPage],
             
      })
    
    
        const handlePageChange = ({ selected }: { selected: number }) => {
            setCurrentPage(selected);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };


  return (
    <div className="wrapper pb-6 min-h-screen">

        {!isLoading ? <>
 
 { data?.vlogs.length < 1 && 

  <div className='flex justify-center items-center flex-col gap-10'>
    <h1 className='text-center mt-4 text-2xl font-bold'>
  Nemáš vytvořený žádný Vlog
  </h1>
  <h1 className='text-center mt-4 text-2xl font-thin'>
  Vlog můžeš vytvořit v sekci <Link to='../traveltips' className='font bold underline'>travelTips</Link>
  </h1>


   <div className="flex flex-1 justify-center mb-4">
   <Image 
               src={fun} 
               alt="fun" 
               className="min-w-[300px] max-w-[400px] w-full h-auto object-contain"
               // Optional, if you want to maintain the aspect ratio
           />
           </div>

           </div>
  } 

          <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-20">
                {

        data.vlogs.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id).map((vlog:any,idx:number)=>{
                
                return(
                    <YourVlog    key={vlog.id}
                            vlog={vlog}

                    />
                    )
                    })

}
  </div> </>: <div className='flex justify-center items-center h-screen'> ... moment prosím </div> 
  }
 { data?.vlogs.length > 10 && 
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

export default YourVlogs