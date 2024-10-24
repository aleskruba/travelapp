import { VlogsProps } from '../../types';


type VlogPropsData  = {
    vlog: VlogsProps;
  };

function Vlog({ vlog}:VlogPropsData) {

    return (
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

  <h2 className='flex justify-start items-center text-base'>vložil/a {vlog.user.firstName}</h2>

  <div>

  </div>
</div>

  )
}

export default Vlog