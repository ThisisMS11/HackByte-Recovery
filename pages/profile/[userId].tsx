import React, { useEffect, useState } from 'react';
import Image from 'next/image';
// import { GoVerified } from 'react-icons/go';
import axios from 'axios';

import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import VideoCard from '../../components/VideoCard';
import NoResults from '../../components/NoResults';
import { IUser, Video } from '../../types';
import { BASE_URL } from '../../utils';

import FollowButton from "../../components/FollowButton";
import { singleUserQuery } from "../../utils/queries";
import { client } from "../../utils/client";
import useAuthStore from "../../store/authStore";

interface IProps {
  data: {
    user: IUser;
    userVideos: Video[];
    userLikedVideos: Video[];
  };
}

const Profile = ({ data }: IProps) => {
  const [showUserVideos, setShowUserVideos] = useState<Boolean>(true);
  const [videosList, setVideosList] = useState<Video[]>([]);

  const { user, userVideos, userLikedVideos } = data;
  const videos = showUserVideos ? 'border-b-2 border-black' : 'text-gray-400';
  const liked = !showUserVideos ? 'border-b-2 border-black' : 'text-gray-400';

  const [followinglist, setFollowinglist] = useState([]);
  const { userProfile }: any = useAuthStore();

  useEffect(() => {
    const fetchVideos = async () => {
      if (showUserVideos) {
        setVideosList(userVideos);
      } else {
        setVideosList(userLikedVideos);
      }
    };

    fetchVideos();
  }, [showUserVideos, userLikedVideos, userVideos]);

  const handlefollow = async (follow: boolean) => {
    console.log("Hello");
    if (userProfile) {
      const res = await axios.put(`${BASE_URL}/api/follow`, {
        userId: userProfile._id,
        postedByID: data.user._id,
        follow,
      });

      setFollowinglist(res.data.following);
    }
  }

  return (
    <div className='w-full'>
      <div className='flex gap-6 md:gap-10 mb-4 bg-inherit w-full'>
        <div className='w-16 h-16 md:w-32 md:h-32'>
          <Image
            width={120}
            height={120}
            layout='responsive'
            className='rounded-full'
            src={user.image}
            alt='user-profile'
          />
        </div>

        <div>
          <div className='text-md md:text-2xl font-bold tracking-wider flex gap-2 items-center justify-center lowercase'>
            <span>{user.userName.replace(/\s+/g, '')} </span>
            {/* <GoVerified className='text-[#f51997]-400 md:text-xl text-md' /> */}
            <FontAwesomeIcon icon={faUserShield} className='text-[#f51997]-400 md:text-xl text-md' />
          </div>
          <p className='text-sm font-medium'> {user.userName}</p>

          <FollowButton
            followinglist={followinglist}
            postedBy={data.user._id}
            handlefollow={() => handlefollow(true)}
            handleunfollow={() => handlefollow(false)}
          />

        </div>
      </div>
      <div>
        <div className='flex gap-10 mb-10 mt-10 border-b-2 border-gray-200 bg-inherit w-full'>
          <p className={`text-xl font-semibold cursor-pointer ${videos} mt-2`} onClick={() => setShowUserVideos(true)}>
            Videos
          </p>
          <p className={`text-xl font-semibold cursor-pointer ${liked} mt-2`} onClick={() => setShowUserVideos(false)}>
            Liked
          </p>
        </div>
        <div className='flex gap-6 flex-wrap md:justify-start'>
          {videosList.length > 0 ? (
            videosList.map((post: Video, idx: number) => (
              <VideoCard key={idx} post={post} />
            ))
          ) : (
            <NoResults
              text={`No ${showUserVideos ? '' : 'Liked'} Videos Yet`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async ({
  params: { userId },
}: {
  params: { userId: string };
}) => {
  const res = await axios.get(`${BASE_URL}/api/profile/${userId}`);

  return {
    props: { data: res.data },
  };
};
export default Profile;
