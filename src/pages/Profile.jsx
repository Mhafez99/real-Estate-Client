import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';

import {
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from '../redux/users/userSlice';

import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUplaodErr, setFileUplaodErr] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  const [showListingsErr, setShowListingsErr] = useState(false);
  const [userListings, setUserListings] = useState([]);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(Math.round(progress));
      },
      (error) => {
        setFileUplaodErr(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update/${
          currentUser._id
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${
          currentUser._id
        }`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signout`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess());
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };
  const handleShowListings = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/listings/${
          currentUser._id
        }`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (data.success === false) {
        setShowListingsErr(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsErr(true);
    }
  };
  const handleLisitngDelete = async (listingId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/listing/delete/${listingId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='Profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='self-center text-sm'>
          {fileUplaodErr ? (
            <span className='text-red-700'>
              Error Image Upload (Image Must be Less than 2 Mb)
            </span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className='text-slate-700'>Uploading {filePercentage}%</span>
          ) : filePercentage === 100 ? (
            <span className='text-green-700'>Image Succussfully Uploaded</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='text'
          defaultValue={currentUser.username}
          placeholder='username'
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='text'
          defaultValue={currentUser.email}
          placeholder='email'
          id='email'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='password'
          id='password'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className='rounded-lg bg-slate-700 text-white uppercase hover:opacity-95 disabled:opacity-80 p-3'>
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/create-listing'}>
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer'>
          Delete Account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign Out
        </span>
      </div>
      <p className='text-red-700 mt-5 text-center'>{error ? error : ''}</p> 
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is Update Successfully' : ''}
      </p>
      <button onClick={handleShowListings} className='text-green-700 w-full'>
        Show Listings
      </button>
      {showListingsErr && (
        <p className='text-red-700 mt-5'>Error Showing Listings</p>
      )}
      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center text-3xl mt-7 font-semibold'>
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt='Listing Cover'
                  className='w-16 h-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 truncate hover:underline font-semibold flex-1'
                to={`/listing/${listing._id}`}>
                <p>{listing.name}</p>
              </Link>
              <div className='flex flex-col items-center'>
                <button
                  onClick={() => handleLisitngDelete(listing._id)}
                  className='text-red-700 uppercase'>
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
