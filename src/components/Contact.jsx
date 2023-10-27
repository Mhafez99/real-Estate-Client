import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Contact = ({ listing }) => {
  Contact.propTypes = {
    listing: PropTypes.shape({
      userRef: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  };

  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/${listing.userRef}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className='flex flex-col gap-2'>
      <p>
        Contact <span className='font-semibold'>{landlord?.username}</span> For{' '}
        <span className='font-semibold'>{listing?.name.toLowerCase()}</span>
      </p>
      <textarea
        id='message'
        name='message'
        rows='2'
        value={message}
        onChange={onChange}
        placeholder='Enter Your Message Here'
        className='w-full border p-3 rounded-lg '
      />
      <Link
        to={`mailto:${landlord?.email}?subject=Regarding ${listing?.name}&body=${message}`}
        className='bg-slate-700 text-white text-center uppercase rounded-lg hover:opacity-80 p-3'>
        Send Message
      </Link>
    </div>
  );
};

export default Contact;
