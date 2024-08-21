import React, { FormEvent, useState } from 'react';
import Button from '../customButton/Button';
import { VlogsProps } from '../../types';
import DOMPurify from 'dompurify';
import { useAuthContext } from '../../context/authContext';
import { useCountryContext } from '../../context/countryContext';
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flip, toast } from 'react-toastify';
import { fetchData } from '../../hooks/useFetchData';

type Props = {
  setOpenDivCreateVlog: (value: boolean) => void;
};

function CreateVlog({ setOpenDivCreateVlog }: Props) {

  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { chosenCountry } = useCountryContext();
  const [errorMessage,setErrorMessage] = useState('')


  const [vlog, setVlog] = useState<Partial<VlogsProps>>({
    country: chosenCountry,
    title: '',
    video: '',
    user_id: user?.id,
  });


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedVlog = DOMPurify.sanitize(event.target.value);
    setVlog({ ...vlog, [event.target.name]: sanitizedVlog });
  };

  const createVlog = async (newVlog: Partial<VlogsProps>) => {

    const response = await fetchData(`${BASE_URL}/vlog`,'POST',newVlog)

/*     const response = await fetch(`${BASE_URL}/vlog`, {
      ...HTTP_CONFIG, 
      method: 'POST',
      body: JSON.stringify(newVlog),
      credentials: 'include',
    });
 */
    if (!response.ok) {
      throw new Error('Chyba při odeslaní zprávy');
    }

    return response.json();
  };

  const createVlogMutation = useMutation({
    mutationFn: createVlog,
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
      queryClient.invalidateQueries({queryKey: ['vlogs',chosenCountry]});
      setErrorMessage('');
      setVlog({
        country: chosenCountry,
        title: '',
        video: '',
        user_id: user?.id,
      });
      setOpenDivCreateVlog(false);
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

      if ((!vlog.title || !vlog.title.trim()) || (!vlog.video || !vlog.video.trim())) {
        setErrorMessage('Musí obsahovat text');
        return;
      }
  
      if (vlog.title && vlog.title.length > 150) {
        setErrorMessage('Příliš dlouhý text, max 150 znaků');
        return;
      }
  
         if (vlog.video && vlog.video.length > 15) {
        setErrorMessage('Příliš dlouhý text, max 15 znaků');
        return;
      }
  

      setErrorMessage('');
  
      createVlogMutation.mutate(vlog);
  
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <form className="space-y-4 p-6 bg-white dark:bg-slate-400 shadow-md rounded-lg max-w-[22rem]" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Titulek max 150 znaků"
        maxLength={150}
        className="w-full p-2 border border-gray-300 rounded dark:bg-slate-200 text-white dark:text-black"
        name="title"
        value={vlog.title}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="YouTube kód ve tvaru: 'dYJpPdSTzGs' "
        maxLength={15}
        className="w-full p-2 border border-gray-300  dark:bg-slate-200 text-white dark:text-black"
        name="video"
        value={vlog.video}
        onChange={handleChange}
  />
      <span className='dark:text-red-600 text-red-800 flex justify-center'>{errorMessage && errorMessage}</span>
      <div className="flex justify-end space-x-2">
    
        <Button type="submit" 
                color="blue" 
                width="16rem"
                className={( !vlog.title?.length && !vlog.video?.length ) 
                  ? 'opacity-30 pointer-events-none' 
                  : ''}
                >Vytvořit Vlog</Button>
        <Button onClick={() => setOpenDivCreateVlog(false)} color="gray" width="16rem">Zpět</Button>

      </div>
    </form>
  );
}

export default CreateVlog;
