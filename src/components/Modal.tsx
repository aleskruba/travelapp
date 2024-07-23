import React, { useEffect,useState , useRef } from 'react';
import { useThemeContext } from '../context/themeContext';
import { motion } from 'framer-motion';

const Modal: React.FC = () => {
  const { modal, toggleModal, image } = useThemeContext();
  const modalRef = useRef<HTMLDivElement>(null);

  const [isBlurred, setIsBlurred] = useState(true);



  useEffect(() => {
    if (modal) {
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        toggleModal();
      }
    };

    if (modal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal]);

  return (
    <>
      {modal && (
        <div className="overlay fixed inset-0 w-full h-full bg-gray-800 bg-opacity-80 z-40 flex justify-center items-center">
          <div ref={modalRef} className="modal-content relative bg-gray-100 p-2 rounded-md max-w-lg w-full mx-4 my-4 z-30">
            <button 
              onClick={() => toggleModal()} 
              className="close-modal absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full z-40"
            >
              &times;
            </button>
            {image && (
              <motion.img
                src={image}
                alt="Profile"
                className="object-cover w-full h-auto rounded"
                initial={{ filter: 'blur(10px)' }}
                animate={{ filter: isBlurred ? 'blur(0px)' : 'blur(0px)' }}
                transition={{ duration: 1 }}
                onAnimationComplete={() => setIsBlurred(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
