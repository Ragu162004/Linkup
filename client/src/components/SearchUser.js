import React, { useEffect, useState } from 'react';
import { IoSearchOutline, IoClose } from 'react-icons/io5';
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast';
import axios from 'axios';

const SearchUser = ({ onClose }) => {
  const [searchUser, setSearchUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearchUser = async () => {
    if (!search) return setSearchUser([]);
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/search-user`;
    try {
      setLoading(true);
      const response = await axios.post(URL, { search });
      setSearchUser(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearchUser();
    }, 400); // debounce to reduce API calls

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4'>
      <div className='relative w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mt-16'>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl'
        >
          <IoClose />
        </button>

        {/* Search Input */}
        <div className='sticky top-0 bg-white z-10 border-b flex items-center px-4 py-3'>
          <input
            type='text'
            placeholder='Search user by name or email...'
            className='w-full px-4 py-2 border rounded-l focus:outline-none focus:ring focus:border-blue-300'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className='bg-primary text-white px-4 py-2 rounded-r'>
            <IoSearchOutline size={20} />
          </div>
        </div>

        {/* User List */}
        <div className='max-h-[400px] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100'>
          {loading ? (
            <div className='text-center py-5'>
              <Loading />
            </div>
          ) : searchUser.length === 0 ? (
            <p className='text-center text-gray-500'>No user found.</p>
          ) : (
            searchUser.map((user) => (
              <UserSearchCard key={user._id} user={user} onClose={onClose} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUser;
