import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

function Profil() {

    const [updateProfile, setUpdateProfile] = useState(false);
    const [updatePassword, setUpdatePassword] = useState(false);
    const { user, setUser, updateUser, setUpdateUser } = useAuthContext();
    const { toggleModal } = useThemeContext();
    const [backendError, setBackendError] = useState('');
    const [backendImageError, setBackendImageError] = useState('');
    const [noChange, setNoChange] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                const maxSize = 150 * 1024; // Convert KB to bytes

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
        

    return (

  <div className="flex items-center h-full pb-4 flex-col pt-8 gap-6 ">
  
            <Link
                to={`/tvojevlogy`}
                className="p-6 rounded-lg shadow-md w-96 flex justify-center items-center font-extrabold bg-gradient-to-br from-teal-600 to-indigo-600 text-white cursor-pointer hover:bg-opacity-90 hover:shadow-lg transition duration-300 ease-in-out"
            >
                Tvoje Vlogy
            </Link>

            <Link
                to={`/tvojespolucesty`}
                className="mt-4 p-6 rounded-lg shadow-md w-96 flex justify-center items-center font-extrabold bg-gradient-to-br from-green-500 to-teal-600 text-white cursor-pointer hover:bg-opacity-90 hover:shadow-lg transition duration-300 ease-in-out"
            >
                Tvoje Spolucesty
            </Link>

            <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-96">
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
                <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-96">
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
                                    className={`w-full border rounded-md p-2 text-black ${updateUser?.googleEmail ? 'bg-gradient-to-r from-red-700 via-yellow-600 to-blue-200 text-white pointer-events-none' : ''}`}
                                    onChange={handleChange}
                                    value={updateUser?.email ?? ''}
                                    maxLength={35}
                                    style={{ paddingRight: '40px' }} // Adjust padding to accommodate the image
                                />
                                {updateUser?.googleEmail && (
                                    <img
                                        src="google.png"
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
                            <input
                                type="submit"
                                value="Ulož"
                                className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 cursor-pointer"
                            />
                        </form>
                    )}

                    {!updateProfile ? (
                        <button
                            onClick={() => { setUpdateProfile(true); setBackendError('') }}
                            className="mt-4 w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 cursor-pointer"
                        >
                            Aktualizovat Profil
                        </button>
                    ) : (
                        <button
                            onClick={() => { setUpdateProfile(false); setBackendError('') }}
                            className="mt-4 w-full bg-gray-500 text-white rounded-md p-2 hover:bg-gray-600 cursor-pointer"
                        >
                            Zrušit
                        </button>
                    )}
                </div>
            }

            {!updateProfile &&
                <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-96">
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
                            <input
                                type="submit"
                                value="Ulož"
                                className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 cursor-pointer"
                            />
                        </form>
                    )}

                    {!updatePassword ? (
                        <button
                            onClick={() => { setUpdatePassword(true); setBackendError('') }}
                            className="mt-4 w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 cursor-pointer"
                        >
                            Změnit heslo
                        </button>
                    ) : (
                        <button
                            onClick={() => { setUpdatePassword(false); setBackendError(''); }}
                            className="mt-4 w-full bg-gray-500 text-white rounded-md p-2 hover:bg-gray-600 cursor-pointer"
                        >
                            Zrušit
                        </button>
                    )}
                </div>
            }

            
        </div>

    );
}

export default Profil;
