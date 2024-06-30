export interface UserProps {
    id:number ;
    username?: string;
    firstName?: string;
    lastName?: string ;
    email: string  ;
    password: string;
    image?: string  ;
    registrationDate: Date | null
    googleId?: string ;
    googleEmail?: string ;
    googleName?: string ;
    googleProfilePicture?: string;
  }