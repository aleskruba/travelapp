import React, { Dispatch, SetStateAction,useState,FormEvent } from 'react';
import { VlogsProps } from '../../types';
import Button from '../customButton/Button';
import DOMPurify from 'dompurify';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flip, toast } from 'react-toastify';
import { fetchData } from '../../hooks/useFetchData';

type Props = {
    vlog: VlogsProps
    setSelectedVlogEditIdtVlog: Dispatch<SetStateAction<number | null>>;

}

function UpdateYourVlog({vlog,setSelectedVlogEditIdtVlog}:Props) {

    const queryClient = useQueryClient();
    
    const [errorMessage,setErrorMessage] = useState('')

    const vlogVideo = vlog.video.split('/').pop()
    const [updateVlog,setUpdateVlog] = useState({
        title: vlog.title,
        video: vlogVideo,
    })


    const handleCancel = () => {
        console.log('hi');
        setSelectedVlogEditIdtVlog(null)
    }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedVlog = DOMPurify.sanitize(event.target.value);
    setUpdateVlog({ ...updateVlog, [event.target.name]: sanitizedVlog });
  };


const updateVlogFunction = async (newVlog: Partial<VlogsProps>) => {

  const response = await fetchData(`${BASE_URL}/vlog/${vlog.id}`,'PUT',newVlog)
/*     const response = await fetch(`${BASE_URL}/vlog/${vlog.id}`, {
      ...HTTP_CONFIG, 
      method: 'PUT',
      body: JSON.stringify(newVlog),
      credentials: 'include',
    }); */

    if (!response.ok) {
      throw new Error('Chyba při odeslaní zprávy');
    }

    return response.json();
  };

  const createVlogMutation = useMutation({
    mutationFn: updateVlogFunction,
    onSuccess: () => {
      toast.success('Nový Vlog byl úspěšně uložen', {
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
      queryClient.invalidateQueries({queryKey: ['yourvlogs']});
      setErrorMessage('');
      setSelectedVlogEditIdtVlog(null)
    },
    onError: () =>  {
      toast.error('Chyba při ukládáni ', {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission

    try {

      if ((!updateVlog.title || !updateVlog.title.trim()) || (!updateVlog.video || !updateVlog.video.trim())) {
        setErrorMessage('Musí obsahovat text');
        return;
      }
  
      if (updateVlog.title && updateVlog.title.length > 150) {
        setErrorMessage('Příliš dlouhý text, max 150 znaků');
        return;
      }
  
         if (updateVlog.video && updateVlog.video.length > 15) {
        setErrorMessage('Příliš dlouhý text, max 15 znaků');
        return;
      }
  

      setErrorMessage('');
  
      createVlogMutation.mutate(updateVlog);
  
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form className="box border border-black rounded-md p-8 text-center grid grid-rows-[subgrid] row-span-4" onSubmit={handleSubmit}>
    <input
      type="text"
      placeholder="Titulek max 150 znaků"
      maxLength={150}
      className="w-full p-2 border border-gray-300 rounded bg-slate-200 text-black"
      name="title"
      value={updateVlog.title}
      onChange={handleChange}
    />
    <input
      type="text"
      placeholder="YouTube kód v podobném tvaru jako: 'dYJpPdSTzGs' "
      maxLength={15}
      className="w-full p-2 border border-gray-300  bg-slate-200 text-black"
      name="video"
      value={updateVlog.video}
      onChange={handleChange}
/>
    <span className='dark:text-red-600 text-red-800 flex justify-center'>{errorMessage && errorMessage}</span>
    
      <div className="flex justify-center space-x-2 w-full">
      <Button 
  type='submit' 
  color="blue"
  className={(updateVlog.title === vlog.title && updateVlog.video === vlog.video.split('/').pop()) 
    ? 'opacity-30 pointer-events-none' 
    : ''}>Uložit</Button>
    <Button type='button' onClick={handleCancel} color="gray">Zpět</Button>
  </div>
    
     </form>
  )
}

export default UpdateYourVlog