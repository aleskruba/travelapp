import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link,Navigate, useNavigate} from 'react-router-dom';
import { useAuthContext } from '../context/authContext';
import { useThemeContext } from '../context/themeContext';
import { UserProps } from '../types';
import DOMPurify from 'dompurify';
import { BASE_URL, HTTP_CONFIG } from '../constants/config';
import { Flip, toast } from 'react-toastify';
import Resizer from "react-image-file-resizer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import EXIF from 'exif-js';
import lide from '../assets/images/lide.svg';
import { fetchData } from '../hooks/useFetchData';
import google from '../assets/images/google.png';
import Button from '../components/customButton/Button';
import ConfirmationModal from '../components/ConfirmationModal';

function Profil() {

    const navigate = useNavigate()

    const [updateProfile, setUpdateProfile] = useState(false);
    const [updatePassword, setUpdatePassword] = useState(false);
    const { user, setUser, updateUser, setUpdateUser } = useAuthContext();
    const { toggleModal } = useThemeContext();
    const [backendError, setBackendError] = useState('');
    const [backendImageError, setBackendImageError] = useState('');
    const [noChange, setNoChange] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(()=>{
        setUpdateUser(user);
        console.log('useEffect profile runs')
      },[])


    const resizeFile = (file: any, orientation: number) =>
        new Promise((resolve, reject) => {
            try {
                Resizer.imageFileResizer(
                    file,
                    200,
                    200,
                    'JPEG',
                    100,
                    orientation,
                    (uri) => {
                        resolve(uri);
                    },
                    'base64'
                );
            } catch (err) {
                reject(err);
            }
        });

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            //@ts-ignore
            EXIF.getData(selectedFile, async function () {
                //@ts-ignore
                const orientation = EXIF.getTag(this, 'Orientation') || 1; // Default to 1 if no orientation tag

                const reader = new FileReader();
                reader.onload = (event) => {
                    setUser((prevUser: UserProps | null) => ({
                        ...prevUser!,
                        image: event.target?.result as string,
                    }));
                };
                reader.readAsDataURL(selectedFile);

                // Check file size
               // const maxSize = 150 * 1024; // Convert KB to bytes

                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!allowedTypes.includes(selectedFile.type)) {
                    alert('Invalid file type. Only JPEG, JPG, or PNG images are allowed.');
                    return;
                }

                try {
                    // Resize the image with the correct orientation
                    const resizedFile = await resizeFile(selectedFile, orientation);
                    if (resizedFile) {
                        // Upload the resized image
                        const response = await fetch(`${BASE_URL}/uploadprofileimage`, {
                            ...HTTP_CONFIG, // Spread HTTP_CONFIG if needed
                            method: 'PUT',
                            body: JSON.stringify({ image: resizedFile }),
                            credentials: 'include', // Set credentials directly here
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                     
                        user && setUser({ ...user, image: data.imageUrl });
                    } else {
                        setBackendImageError('Error resizing the image.');
                        console.error('Error resizing the image.');
                    }
                } catch (error) {
                    console.error('Error resizing the image:', error);
                    setBackendImageError('Error resizing the image.');
                }
            });
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);
        setUpdateUser((prevUser: UserProps | null) => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                [name]: sanitizedValue
            };
        });
    };


    const handleSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {

        if (updateUser?.username === user?.username && updateUser?.firstName === user?.firstName &&
          updateUser?.lastName === user?.lastName && updateUser?.email === user?.email) {
        
            setUpdateProfile(false);
            setNoChange('Neprovedena žádná změna ')
            setTimeout(() => {setNoChange('')},1000);
            return;
      }
    
      if (updateUser) {
        if(updateUser.username && (updateUser.username.trim().length < 4 || updateUser.username.trim().length > 15)) {
          setBackendError('Username musí mít 4 až 15 znaků F')
          return;
        } 
        if(updateUser.firstName && (updateUser.firstName.trim().length < 4 || updateUser.firstName.trim().length > 15)) {
          setBackendError('Jméno musí mít 4 až 15 znaků F')
          return;
        } 
        if(updateUser.lastName && (updateUser.lastName.trim().length < 4 || updateUser.lastName.trim().length > 15)) {
          setBackendError('Příjmení musí mít 4 až 15 znaků F')
        }
        if(updateUser.lastName && (updateUser.lastName.trim().length < 4 || updateUser.lastName.trim().length > 15)) {
          setBackendError('Email  musí mít 4 až 50 znaků F')
        }
        const response = await fetchData(`${BASE_URL}/updateprofile`,'PUT',updateUser)
/*         const response = await fetch(`${BASE_URL}/updateprofile`, {
            ...HTTP_CONFIG, // Spread HTTP_CONFIG if needed
            method: 'PUT',
            body: JSON.stringify(updateUser),
            credentials: 'include', // Set credentials directly here
        }); */

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }

        const data = await response.json();
        console.log(data)
   
        toast.success('Update proběhl úspěšně', {
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
              setUpdateProfile(false);
 
}
        }catch(e){
            console.error(e)
            toast.error('Chyba při úpravě profilu', {
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
      }



 const handleSubmitPassword = async (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    try {
    if (updateUser) {

            if(updateUser.password !== updateUser.confirmPassword) {
              setBackendError('Hesla nejsou stejná ')
              return;
            } 
            if(updateUser.password.trim().length < 8 || updateUser.password.trim().length > 50)  {
              setBackendError('Heslo musí mít 8 až 50 znaků')
              return;
            } 
            const response = await fetchData(`${BASE_URL}/updatepassword`,'PUT',{password:updateUser.password, confirmPassword:updateUser.confirmPassword})
/*             const response = await fetch(`${BASE_URL}/updatepassword`, {
                ...HTTP_CONFIG, // Spread HTTP_CONFIG if needed
                method: 'PUT',
                body: JSON.stringify({password:updateUser.password, confirmPassword:updateUser.confirmPassword} ),
                credentials: 'include', // Set credentials directly here
            });
     */
        
            
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
    
            }
              
            toast.success('Změna hesla proběhla úspěšně', {
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
            setUpdatePassword(false);
  

    }

}catch(e){
    console.error(e)
    toast.error('Chyba při změně hesla', {
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
 }
        
 const handleDeleteAccountClick = () => {

    setShowModal(true);
  };

const deleteAccount = async () =>{

    try{
    const response = await fetchData(`${BASE_URL}/deleteprofile`,'DELETE',{
        
    })

    console.log(response);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete account');
            }
    
            const data = await response.json();
            console.log(data)
            setShowModal(false)
            setUser(null);
            navigate('/')
       
            toast.success('Účet byl úspěšme smazán', {
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
           
     
            }catch(e){
                console.error(e)
                toast.error('Chyba při smazání profilu', {
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
          }
    
    return (

  <div className="flex items-center h-full pb-4 flex-col pt-8 px-2 gap-6 ">
  
            <Link
                to={`/yourvlogs`}
                className="p-6 rounded-lg shadow-md w-full md:w-[35rem] flex justify-center items-center font-extrabold bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 dark:text-white cursor-pointer hover:shadow-lg dark:hover:from-slate-600 dark:hover:to-slate-500 transition duration-300 ease-in-out"

            >
                Tvoje Vlogy
            </Link>

            <Link
                to={`/yourtours`}
                className="p-6 rounded-lg shadow-md w-full md:w-[35rem] flex justify-center items-center font-extrabold bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 dark:text-white cursor-pointer hover:shadow-lg dark:hover:from-slate-600 dark:hover:to-slate-500 transition duration-300 ease-in-out"

            >
                Tvoje Spolucesty
            </Link>

            <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
                <div className="col-span-full">
                    <label htmlFor="photo" className="text-lg font-semibold mb-2">Foto</label>
                    <div className="mt-2 flex items-center gap-x-3 w-full justify-center"     
                         onClick={() => toggleModal(user?.image ? user.image : lide)}
                         >
                        <img
                            src={user?.image ? user?.image : lide}
                            alt="Profile"
                            className="h-16 w-16 rounded-full object-cover text-gray-300"

                        />

                        <label htmlFor="imageInput" className="cursor-pointer">
                            <span className="relative">
                                <input
                                    type="file"
                                    id="imageInput"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <span className="bg-gray-200 dark:text-black hover:bg-gray-300 py-2 px-4 rounded-md cursor-pointer">
                                    Vyber novou fotku
                                </span>
                            </span>
                        </label>
                    </div>

                    {backendImageError && <div className="text-red-800">{backendImageError}</div>}
                </div>
            </div>

            {!updatePassword &&
                <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
                    {noChange && <div className="text-red-800 text-center">{noChange}</div>}
                    {!updateProfile ? (
                        <div>
                            <div className="text-lg font-semibold mb-2">Tvůj profil</div>
                            <div className="mb-2">Username: {updateUser?.username}</div>
                            <div className="mb-2">Jméno: {updateUser?.firstName}</div>
                            <div className="mb-2">Příjmění: {updateUser?.lastName}</div>
                            <div>Email: {user?.email}</div>
                        </div>
                    ) : (
                        <form className="space-y-4 dark:bg-gray-500 dark:text-gray-100" onSubmit={handleSubmitProfile}>
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                className="w-full border rounded-md p-2 text-black"
                                onChange={handleChange}
                                value={updateUser?.username ?? ''}
                                maxLength={20}
                            />
                            <input
                                type="text"
                                placeholder="Jméno"
                                name="firstName"
                                className="w-full border rounded-md p-2 text-black"
                                onChange={handleChange}
                                value={updateUser?.firstName ?? ''}
                                maxLength={20}
                            />
                            <input
                                type="text"
                                placeholder="Příjmení"
                                name="lastName"
                                className="w-full border rounded-md p-2 text-black"
                                onChange={handleChange}
                                value={updateUser?.lastName ?? ''}
                                maxLength={20}
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name={updateUser?.googleEmail ? '' : 'email'}
                                    className={`w-full border rounded-md p-2 text-black ${user
                                        ?.googleEmail ? 'bg-gradient-to-r from-red-700 via-yellow-600 to-blue-200 text-white pointer-events-none' : ''}`}
                                    onChange={handleChange}
                                    value={updateUser?.email ?? ''}
                                    maxLength={35}
                                    style={{ paddingRight: '40px' }} // Adjust padding to accommodate the image
                                />
                                {updateUser?.googleEmail && (
                                    <img
                                        src={google}
                                        alt="Google Logo"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '25px',
                                            height: '25px',
                                        }}
                                    />
                                )}
                            </div>

                            {user?.googleEmail ? <span className='text-xs text-violet-700'>pokud jsi přihlášený s Googlem nemůžeš měnit email</span> : ''}
                            {backendError && <div className="text-red-800">{backendError}</div>}
                            <Button 
                                    type="submit" 
                                    color="blue" 
                                    className="w-full"
                                    >
                                    Ulož
                                    </Button>
                        </form>
                    )}

                        {!updateProfile ? (
                        <Button
                            onClick={() => { setUpdateProfile(true); setBackendError(''); }}
                            color="blue"
                            className="mt-4 w-full"
                        >
                            Aktualizovat Profil
                        </Button>
                        ) : (
                        <Button
                            onClick={() => { setUpdateProfile(false); setBackendError(''); }}
                            color="gray"
                            className="mt-4 w-full border-1.5"
                        >
                            Zrušit
                        </Button>
                        )}

                </div>
            }

            {!updateProfile &&
                <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
                    {!updatePassword ? (
                        <div>
                            <div className="text-lg font-semibold mb-2">Heslo</div>
                        </div>
                    ) : (
                        <form className="space-y-4 relative" onSubmit={handleSubmitPassword}>
                            <input type="text" name="username" style={{ display: 'none' }} aria-hidden="true" autoComplete="username" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="nové heslo"
                                className="w-full border rounded-md p-2 text-black"
                                maxLength={20}
                                autoComplete="new-password"
                                onChange={handleChange}
                            />

                            <div className="absolute top-3 text-xl right-1 flex items-center pr-3">
                                {showPassword ? <FaEye onClick={() => setShowPassword(false)} /> : <FaEyeSlash onClick={() => setShowPassword(true)} />}
                            </div>

                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="opakuj heslo"
                                className="w-full border rounded-md p-2 text-black"
                                maxLength={20}
                                autoComplete="new-password"
                                onChange={handleChange}
                            />
                            <div className="absolute top-[72px] text-xl right-1 flex items-center pr-3">
                                {showPassword ? <FaEye onClick={() => setShowPassword(false)} /> : <FaEyeSlash onClick={() => setShowPassword(true)} />}
                            </div>

                            {backendError && <div className="text-red-800">{backendError}</div>}
                            <Button 
                                type="submit" 
                                color="blue" 
                                className="w-full"
                                >
                                Ulož
                                </Button>

                        </form>
                    )}

                        {!updatePassword ? (
                        <Button
                            onClick={() => { setUpdatePassword(true); setBackendError(''); }}
                            color="blue"
                            className="mt-4 w-full"
                        >
                            Změnit heslo
                        </Button>
                        ) : (
                        <Button
                            onClick={() => { setUpdatePassword(false); setBackendError(''); }}
                            color="gray"
                            className="mt-4 w-full border-1.5"
                        >
                            Zrušit
                        </Button>
                        )}

                </div>
            }

<div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
                             <Button 
                                type="button" 
                                color="red" 
                                className="w-full"
                                onClick={handleDeleteAccountClick}
                                >
                                Smazat účet
                            </Button>
                                </div>


        <ConfirmationModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={() => deleteAccount() }
            message="Chceš opravdu smazat svůj účet ? "
      />                     
        </div>

    );
}

export default Profil;
