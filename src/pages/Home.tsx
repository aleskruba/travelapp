
import Image from '../custom/Image'
import fun from '../assets/images/fun.png';
import { useAuthContext } from '../context/authContext';
import { Link } from 'react-router-dom';
import { useLanguageContext } from '../context/languageContext';
import { homeConstants, homeWelcome } from '../constants/constantsHome';
import { navbarConstants } from "../constants/constantsData";
import InfoMessage from '../components/InfoMessage';
function Home() {

  const {user,isLoading} = useAuthContext()
  const { language} = useLanguageContext();
  const { isServerOn,isSocketServerOn,isRedisOn } = useAuthContext();

  if (isLoading) return <div className='flex flex-col gap-4 h-screen justify-center items-center'> 
        

{navbarConstants.waitplease[language]}
    
 
<InfoMessage
   message={
     isServerOn === null
       ? 'Checking Server...'
       : isServerOn
       ? 'Server is ON'
       : 'Server is OFF'
   }
   status={isServerOn}
 />

<InfoMessage
   message={
     isSocketServerOn === null
       ? 'Checking Socket Server...'
       : isSocketServerOn
       ? 'Socket Server is ON'
       : 'Socket Server is OFF'
   }
   status={isSocketServerOn}
 />


   <InfoMessage
 message={
   isRedisOn === null
     ? 'Checking Redis Server...'
     : isRedisOn
     ? 'Redis Server is ON'
     : 'Redis is OFF'
 }
 status={isRedisOn}
/>

</div>
 

  return (
    <div className="flex h-full flex-col md:flex-row dark:text-lighTextColor px-2 py-2 md:px-6 md:py-6 ">


    <div className="flex  flex-col md:flex-row">


      <div className="flex-1 text-xl">

    {user?.isAdmin && 
          <div className="flex flex-col gap-2 pb-4">
          <h1 className="font-thin text-3xl italic">WELCOME ADMIN !!!!!!</h1>
          <Link 
            to="admin" 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 inline-block max-w-52 text-center"
          >
            ADMIN ZONE
          </Link>
          </div>

    }

      <p> {homeWelcome[language]}<span className='dark:text-blue-500  text-blue-600 font-bold'> {user? user.firstName ? user.firstName : user.email : ''} </span>! </p>
      <br />
      <div
        dangerouslySetInnerHTML={{ __html: homeConstants[language] }}
      />
{/*       <p> Jsme tu pro vás, abychom vám poskytli užitečné informace a inspiraci pro vaše cestovní plány. Naše stránky jsou zdrojem poznatků o turisticky zajímavých státech po celém světě, které vám pomohou naplánovat nezapomenutelnou dovolenou.</p>
      <br />
<p>Prozkoumejte naše obsáhlé přehledy destinací, kde každý stát má svou vlastní stránku plnou zajímavostí, tipů a užitečných informací. Každý stát je doplněn osobními komentáři a videi od našich redaktorů a cestovatelů, kteří sdílejí své zážitky a rady.</p>
<br />
<p>Nemáte jasnou představu, kam se vydat? Nebojte se, naše stránky vám poskytnou dostatek inspirace a informací, abyste mohli najít tu pravou destinaci pro svou dovolenou. A pokud máte nějaké konkrétní otázky nebo potřebujete poradit, neváhejte se obrátit na naši komunitu cestovatelů.</p>
<br />
<p>Navíc, pokud hledáte spolucestujícího do nějakého státu, jste na správném místě! Naše stránky nabízejí fórum, kde můžete najít společníka pro vaše dobrodružné plány. Sdílejte své cestovatelské přání a najděte si spolucestujícího, se kterým se vydáte na nezapomenutelnou dobrodružnou cestu.</p>
<br />
<p>Nechte se inspirovat našimi stránkami a připravte se na nezapomenutelné zážitky, které vás čekají na cestách po světě!</p>
 */}
      </div>
      <div className="flex flex-1 justify-center mb-4">
  <Image 
            src={fun} 
            alt="fun" 
            className="min-w-[300px] max-w-[400px] w-full h-auto object-contain"
            // Optional, if you want to maintain the aspect ratio
          />
        </div>

    </div>


    </div>
  )
}

export default Home