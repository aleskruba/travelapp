import { useEffect, useState } from 'react';

interface InfoMessageProps {
  message: string;
  status: boolean | null;
}

function InfoMessage({ message, status }: InfoMessageProps) {

  return (
    <div
      className={`w-[300px] text-center z-50 px-6 py-2 rounded-xl text-2xl text-white shadow-lg transition-all duration-1000 ease-in-out 
      } ${
        status === true ? 'bg-green-800' : status === null ? 'bg-yellow-500' : 'bg-red-800'
      }`}
    >
      {message}
    </div>
  );
}

export default InfoMessage;
