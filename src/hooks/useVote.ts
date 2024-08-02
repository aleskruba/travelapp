import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { useCountryContext } from '../context/countryContext';
import { useAuthContext } from '../context/authContext';

interface UserProps {
  id: number | null;
  email: string | null;
  firstName?: string | null;
  [key: string]: any;
}


type VoteResponse = {
  id?: number,
  user_id:number | null,
  message_id:string,
  reply_id?:string,
  vote_type:string,
  vote_date? :Date
}
  const useVote = (country:string)=> {

    const { chosenCountry } = useCountryContext();
    const { user } = useAuthContext();
  //const [vote, setVote] = useState<'thumb_up' | 'thumb_down' | null>(null);
  const [votes, setVotes] = useState<VoteResponse[]>([]);
  const [votesReply, setVotesReply] = useState<VoteResponse[]>([]);
  const  [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${chosenCountry}/votes`);
        const responseReply = await axios.get(`${BASE_URL}/${chosenCountry}/votesreply`);
   
        setVotes(response.data.votes)
        setVotesReply(responseReply.data.votesReply)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    fetchVotes();
  }, []);

  const handleVote = async (voteType: 'thumb_up' | 'thumb_down',message_id:any) => {

    if (user) {

      const newVote = {
        user_id: user.id,
        vote_type: voteType,
        message_id:message_id
      }
   
    try {
      const response = await axios.post(`${BASE_URL}/${country}/vote`,newVote);

      const responseReply = await axios.post(`${BASE_URL}/${country}/votereply`,newVote);
 
      if (response.status === 201 ) {
  
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }
  };

  const handleVoteReply = async (voteType: 'thumb_up' | 'thumb_down',reply_id:any,message_id:any) => {

    if (user) {

      const newVote = {
        user_id: user.id,
        vote_type: voteType,
        message_id:message_id,
        reply_id:reply_id
      }
   
    try {
      const response = await axios.post(`${BASE_URL}/${country}/votereply`,newVote);


      console.log(response);
      if (response.status === 201 ) {
  
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }
  };

  return {
    isLoading,
  votes,
  handleVote,
  handleVoteReply,
  setVotes,
  votesReply,
  setVotesReply
};
};

export default useVote;
