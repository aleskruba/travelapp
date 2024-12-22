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
      const timeout = setTimeout(() => setIsVisible(false), 3500); // Hide after 3500ms
      return () => clearTimeout(timeout); // Cleanup timeout
    }
  }, [status]);

  if (!isVisible) return null; // Don't render the component if not visible

  return (
    <div
      className={`w-full flex flex-col md:flex-row md:justify-around text-center z-50 px-6 py-2 rounded-xl text-2xl text-white shadow-lg transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${
        status === true ? 'bg-green-800' : status === null ? 'bg-yellow-500' : 'bg-red-800'
      }`}
    >
      {message}
    </div>
  );
}

export default InfoMessage;
