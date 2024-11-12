import { useThemeContext } from '../../context/themeContext';
import { useAuthContext } from '../../context/authContext';
import lide from '../../assets/images/lide.svg';
import Resizer from "react-image-file-resizer";
import { BASE_URL, HTTP_CONFIG } from '../../constants/config';
import { ChangeEvent, useState } from 'react';
import { UserProps } from '../../types';
import EXIF from 'exif-js';
import { authConstants } from "../../constants/constantsAuth";
import { navbarConstants } from "../../constants/constantsData";
import { useLanguageContext } from '../../context/languageContext';

export const UpdateImage = () => {
    const { toggleModal } = useThemeContext();
    const { user,setUser} = useAuthContext();
    const [backendImageError, setBackendImageError] = useState('');
    const { language} = useLanguageContext();

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

  return (
    <div className="bg-gray-100 dark:bg-gray-500 dark:text-gray-100 p-6 rounded-lg shadow-md w-full md:w-[35rem]">
    <div className="col-span-full">
     {/*    <label htmlFor="photo" className="text-lg font-semibold mb-2">Foto</label> */}
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
                         {authConstants.newPhoto[language]}
                    </span>
                </span>
            </label>
        </div>

        {backendImageError && <div className="text-red-800">{backendImageError}</div>}
    </div>
</div>
  )
}
