import React, { useState } from 'react'
import { VlogsProps } from '../../types';
import Button from '../customButton/Button';
import ConfirmationModal from '../ConfirmationModal';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { Flip, toast } from 'react-toastify';
import UpdateYourVlog from './UpdateYourVlog';

type Vlog = {
    vlog: VlogsProps;
  };

function YourVlog({ vlog}:Vlog)  {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedVlogId, setSelectedVlogId] = useState<number | null>(null);
    const [selectedVlogEditId,setSelectedVlogEditIdtVlog] = useState<number | null>(null);

    const queryClient = useQueryClient();

    const handleEditVlogClick = (ID: number) => {
        setSelectedVlogEditIdtVlog(ID);
        };

    const handleDeleteVlogClick = (ID: number) => {
        setSelectedVlogId(ID);
        setShowModal(true);
        };

    const deleteVlogFunction = async (id:number): Promise<any> => {

            const response = await fetch(`${BASE_URL}/vlog/${id}`,{
             ...HTTP_CONFIG, 
             method: 'DELETE',
             credentials: 'include',
            })
            queryClient.invalidateQueries({queryKey: ['vlogs']});
         
            if (!response.ok) {
             throw new Error('Chyba při odeslaní zprávy');
           }
           const data = response.json();
           return data;
           }

           const deleteVlogMutation = useMutation({
            mutationFn: deleteVlogFunction,
            onSuccess: () => {
                toast.success('Vlog byl smazán', {
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
              queryClient.invalidateQueries({queryKey: ['vlogs']});
              setShowModal(false)
            },
            onError: () =>  {
                toast.error('Chyba při mazání vlogu ', {
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
           

    return (
        <> {!selectedVlogEditId ? 
        <div className="box border border-black rounded-md p-8 text-center grid grid-rows-[subgrid] row-span-4">
          <h2 className='text-xl'>{vlog.title}</h2>
        
          <div className="flex justify-center items-center ">
            <iframe
              className="w-full h-[16rem]"
              src={vlog.video}
              title={vlog.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        
          <div className="flex justify-center space-x-2 w-full">
        <Button onClick={() => handleEditVlogClick(vlog.id)} color="blue">Upravit</Button>
        <Button onClick={() => handleDeleteVlogClick(vlog.id)} color="red">Smazat</Button>
      </div>
        
          <div>
        
          </div>
       
          <ConfirmationModal
      show={showModal}
      onClose={() => setShowModal(false)}
      onConfirm={()=>{selectedVlogId && deleteVlogMutation.mutate(selectedVlogId)}}             
      message="Chceš opravdu smazat tuto zprávu?"
    /> 
        </div>
        : 
   
            <UpdateYourVlog 
                        vlog={vlog}
                        setSelectedVlogEditIdtVlog={setSelectedVlogEditIdtVlog}
                        />
       
       }
        </>
          )

        

}

export default YourVlog