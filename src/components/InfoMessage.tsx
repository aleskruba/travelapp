import { useEffect, useState } from 'react';

interface InfoMessageProps {
  message: string;
  status: boolean | null;
}

function InfoMessage({ message, status }: InfoMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== null) {
      setIsVisible(true); // Show the message
      const timeout = setTimeout(() => setIsVisible(false), 2000); // Hide after 3500ms
      return () => clearTimeout(timeout); // Cleanup timeout
    }
  }, [status]);

  return (
    <div
      className={`absolute w-[300px] text-center z-50 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-2xl text-white shadow-lg transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${status === true ? 'bg-green-800' : status === false ? 'bg-red-800' : ''}`}
    >
      {message}
    </div>
  );
}

export default InfoMessage;
