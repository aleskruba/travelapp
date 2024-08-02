export interface UserProps {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  image?: string;
  registrationDate: Date | null;
  googleId?: string;
  googleEmail?: string;
  googleName?: string;
  googleProfilePicture?: string;
  passwordUpdatedAt?: Date | null;
}

export type MessageProps = {
  id: number;
  date: Date;
  message: string;
  user_id: number | null;
  country: string;
  user: UserProps;
  reply: ReplyProps[];
};

export type ReplyProps = {
  id: number;
  date: Date;
  message: string;
  user_id: number | null;
  message_id: number | null;
  user: UserProps;
};

export const initialUserState: UserProps = {
  id: 0,
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  image: '',
  registrationDate: null,
  googleId: '',
  googleEmail: '',
  googleName: '',
  googleProfilePicture: '',
  passwordUpdatedAt: null,
};

export const initialSingleReplyState: ReplyProps = {
  id: 0,
  date: new Date(),
  message: '',
  user_id: null,
  message_id: null,
  user: initialUserState,
};

export const initialReplyState: ReplyProps[] = [
  {
    id: 0,
    date: new Date(),
    message: '',
    user_id: null,
    message_id: null,
    user: initialUserState,
  },
];

export const initialMessageState: MessageProps = {
  id: 0,
  date: new Date(),
  message: '',
  user_id: null,
  country: '',
  user: initialUserState,
  reply: initialReplyState,
};


export type ChosenCountryData = {
  name: string;
  population: string;
  currency: string;
  language: string;
  capital: string;
  area: string;
  continent: string;
  flag:string;
};

