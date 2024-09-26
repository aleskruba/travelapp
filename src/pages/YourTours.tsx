import React from 'react'
import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/authContext';
import { BASE_URL } from '../constants/config';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import Tour from '../components/tours/Tour';
import Button from '../components/customButton/Button';
import { ImArrowUp } from "react-icons/im";
import ConfirmationModal from '../components/ConfirmationModal';
import { Flip, toast } from 'react-toastify';
import { fetchData } from '../hooks/useFetchData';

function YourTours() {
    const queryClient = useQueryClient();

    const [backendError, setBackendError] = useState<string | null>(null);
    const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    
    const fetchTours = async () => {
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

    const { data, isLoading, isError } = useQuery({
        queryFn: () => fetchTours(),
        queryKey: ['yourtours'],
        retry: 2,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
        staleTime: 100000,
    });

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
            toast.success('Spolucesta byla smazána', {
                position: "top-left",
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Flip,
            });
            queryClient.invalidateQueries({ queryKey: ['yourtours'] });
            setShowModal(false);
        },
        onError: () => {
            toast.error('Chyba při mazání spolucesty', {
                position: "top-left",
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Flip,
            });
        }
    });

    const handleEditTourClick = (id: number) => {
        console.log(id);
    };

    const handleDeleteTourClick = (ID: number) => {
        setSelectedTourId(ID);
        setShowModal(true);
    };

    if (isLoading) {
        return <span>Moment prosím ...</span>;
    }

    if (isError) {
        return <span>Něco se pokazilo, spolucety nebyly načteny</span>;
    }

    return (
        <div>
            <h1 className='text-center mt-4'>Můžeš vytvořit maximálně 4 spolucesty</h1>
            <div className='text-center text-blue-500 '>
                <Link to={'../createtour'}>
                    Vytvoř spolucestu <span className="underline cursor-pointer text-blue-600">zde</span>
                </Link>
            </div>

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
                                        <Link to={`${tour.id}`} className='px-4 py-2 rounded font-semibold focus:outline-none bg-blue-500 text-white hover:bg-blue-600'>Upravit</Link>
                                        <Button onClick={() => (tour.id)} color="red">Smazat</Button>
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
