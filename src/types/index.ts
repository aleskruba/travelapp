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
  votes: VoteProps[];
};

export type ReplyProps = {
  id: number;
  date: Date;
  message: string;
  user_id: number | null;
  message_id: number | null;
  user: UserProps;
  votesreply: ReplyVoteProps[];
};

export type VoteProps = {
  id: number;
  user_id: number | null;
  message_id: number | null;
  vote_type: string;
  vote_date: Date;
};

export type ReplyVoteProps = {
  id: number;
  user_id: number | null;
  message_id: number | null;
  reply_id: number | null;
  vote_type: string;
  vote_date: Date;
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
  votesreply: [
    {
      id: 0,
      vote_date: new Date(),
      reply_id: null,
      message_id: null,
      user_id: null,
      vote_type: '',
    }
  ]
};

export const initialReplyState: ReplyProps[] = [
  {
    id: 0,
    date: new Date(),
    message: '',
    user_id: null,
    message_id: null,
    user: initialUserState,
    votesreply: [
      {
        id: 0,
        vote_date: new Date(),
        message_id: null,
        reply_id: null,
        user_id: null,
        vote_type: '',
      }
    ]
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
  votes: [
    {
      id: 0,
      vote_date: new Date(),
      message_id: null,
      user_id: null,
      vote_type: '',
    }
  ]
};


export type VlogsProps = {
  id: number;
  country: string;
  title: string;
  video:string;
  user_id: number | null;
  user: UserProps;
}



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


export type TourProps = {
  id: number;
  destination?: string | null; 
  date?: string | Date |null; 
  tourdate?: string |  Date |null; 
  tourdateEnd?: string | Date | null; 
  tourtype?: string[] | null;
  fellowtraveler?: string | null; 
  aboutme?: string | null; 
  user_id?: number | null; 
  user: UserProps;
};


export const initialToureState: TourProps = {
  id: 0,
  destination: null,
  date: new Date(),
  tourdate: new Date(),
  tourdateEnd: new Date(),
  tourtype: null,
  fellowtraveler: null,
  aboutme: null,
  user_id: null,
  user: initialUserState
};


export type TourMessageProps = {
  id: number;
  date: Date;
  message: string;
  user_id: number | null;
  tour_id: number | null;
  user: UserProps;
  tourreply: TourReplyProps[];
}

export type TourReplyProps = {
  id: number;
  date: Date;
  message: string;
  messagetype:number;
  user_id: number | null;
  tourmessage_id: number | null;
  user: UserProps;
};


export const initialSingleTourReplyState: TourReplyProps = {
  id: 0,
  date: new Date(),
  message: '',
  messagetype:0,
  user_id: null,
  tourmessage_id: null,
  user: initialUserState,

};

export const initialTourReplyState: TourReplyProps[] = [
  {
    id: 0,
    date: new Date(),
    message: '',
    messagetype:0,
    user_id: null,
    tourmessage_id: null,
    user: initialUserState,

  },
];

export const initialTourMessageState: TourMessageProps = {
  id: 0,
  date: new Date(),
  message: '',
  user_id: null,
  tour_id: null,
  user: initialUserState,
  tourreply: initialTourReplyState,

};