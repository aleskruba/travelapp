import { useEffect, useState } from 'react';
import { BASE_URL } from '../constants/config';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import Tour from '../components/tours/Tour';
import Button from '../components/customButton/Button';
import { ImArrowUp } from "react-icons/im";
import ConfirmationModal from '../components/ConfirmationModal';
import { fetchData } from '../hooks/useFetchData';
import { useTourContext } from '../context/tourContext';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';
import Image from '../custom/Image';
import fun from '../assets/images/fun.png';

function YourTours() {
    const queryClient = useQueryClient();

    const [backendError, setBackendError] = useState<string | null>(null);
    const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const {setYourToursLength } = useTourContext();

    const url = `${BASE_URL}/yourtours`;

    const fetchTours = async () => {

        try {
        const response = await fetchData(url,'GET');
    
        if (!response.ok) {
              setBackendError('Chyba při získaní dat');
             return null;
        }
  
        backendError && setBackendError(null);
        
        return response.json();
        }catch (err) {
          setBackendError('Chyba při získaní dat');
          return null;
        }
          };

/*     const fetchTours = async () => {
        const url = `${BASE_URL}/yourtours`;
        try {
          const response = await fetch(url, {
            credentials: 'include', // Include cookies in the request
          });
      
          if (!response.ok) {
            throw new Error('Něco se pokazilo, spolucesty nebyly načteny');
          }
      
          backendError && setBackendError(null);
          return await response.json();
        } catch (error: any) {
          setBackendError(error.message);
          return null;
        }
    };
 */
    const { data, isLoading, isError } = useQuery({
        queryFn: () => fetchTours(),
        queryKey: ['yourtours'],
        retry: 2,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
        staleTime: 100000,
    });

  

    useEffect(() => {
        if (data && data.yourtours) {
            setYourToursLength(data.yourtours.length);
        }
    }, [data]);

    const deleteTourFunction = async (id: number): Promise<any> => {
        const response = await fetchData(`${BASE_URL}/tour/${id}`, 'DELETE');
        queryClient.invalidateQueries({ queryKey: ['yourtours'] });
        
        if (!response.ok) {
          throw new Error('Chyba při odeslaní zprávy');
        }
        const data = response.json();
        return data;
    };

    // Move useMutation hook to top level, outside of conditional rendering
    const deleteTourMutation = useMutation({
        mutationFn: deleteTourFunction,
        onSuccess: () => {
            showSuccessToast('Spolucesta byla smazána')
            queryClient.invalidateQueries({ queryKey: ['yourtours'] });
            setShowModal(false);
        },
        onError: () => {
            showErrorToast('Chyba při mazání spolucesty')
            }
    });


    const handleDeleteTourClick = (ID: number) => {
        setSelectedTourId(ID);
        setShowModal(true);
    };

    if (isLoading) {
        return <div className='flex justify-center items-center h-screen'><span>Moment prosím ...</span></div>;
    }

    if (isError) {
        return <span>Něco se pokazilo, spolucety nebyly načteny</span>;
    }

    return (
        <div className='min-h-screen'>
             <h1 className='text-center mt-4 text-2xl font-bold'>
           { data.yourtours.length < 1 && 'Nemáš vytvořenou žádnou spolucestu' } 
           </h1>
           
            <h1 className='text-center mt-4 text-2xl font-thin'>Můžeš vytvořit maximálně 4 spolucesty</h1>
            <div className='text-center text-blue-500 text-xl'>
                <Link to={'../createtour'}>
                    Vytvoř spolucestu <span className="underline cursor-pointer text-blue-600">zde</span>
                </Link>
            </div>
            { data.yourtours.length < 1 && <>
                <div className="flex flex-1 justify-center mb-4">
                <Image 
                            src={fun} 
                            alt="fun" 
                            className="min-w-[300px] max-w-[400px] w-full h-auto object-contain"
                            // Optional, if you want to maintain the aspect ratio
                        />
                        </div>
            
                </>
            }
            <div className="wrapper grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-8 mb-8 md:px-20">
                {data.yourtours
                .sort((a: { tourdateEnd: string }, b: { tourdateEnd: string }) => 
                    new Date(b.tourdateEnd).getTime() - new Date(a.tourdateEnd).getTime()
                )
                .map((tour: any) => {
                    if (
                        new Date(tour.tourdateEnd).getFullYear() > new Date().getFullYear() ||
                        (new Date(tour.tourdateEnd).getFullYear() === new Date().getFullYear() &&
                         new Date(tour.tourdateEnd).getMonth() >= new Date().getMonth())
                    ) {
                        return (
                            <div className='flex flex-col gap-0' key={tour.id}>
                                <Tour tour={tour} />
                                <div className="flex justify-center space-x-2 w-full border-dashed border-current dark:border-white border-b-2 border-r-2 border-l-2 pb-2 pt-2 rounded-md">
                                    <Link to={`${tour.id}`} className='px-4 py-2 rounded font-semibold focus:outline-none bg-blue-500 text-white hover:bg-blue-600'>Upravit</Link>
                                    <Button onClick={() => handleDeleteTourClick(tour.id)} color="red">Smazat</Button>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div className='flex flex-col justify-center gap-2 relative' key={tour.id}>
                                <div className='flex justify-center font-bold items-center gap-2 absolute top-16 right-14'>Prošlá splucesta <ImArrowUp /></div>
                                <div className='flex flex-col gap-0'>
                                    <div className='opacity-30'>
                                        <Tour tour={tour} />
                                    </div>
                                    <div className="flex justify-center space-x-2 w-full border-dashed border-current dark:border-white border-b-2 border-r-2 border-l-2 pb-2 pt-2 rounded-md">
                                        <Link to={`${tour.id}`} 
                                              className='px-4 py-2 rounded font-semibold focus:outline-none bg-blue-500 text-white hover:bg-blue-600'>
                                        Upravit
                                        </Link>
                                      
                                        <Button  onClick={() => handleDeleteTourClick(tour.id)} color="red">Smazat</Button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            <ConfirmationModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={() => { selectedTourId && deleteTourMutation.mutate(selectedTourId); }}
                message="Chceš opravdu smazat tuto zprávu?"
            />
        </div>
    );
}

export default YourTours;
