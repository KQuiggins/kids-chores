'use client';

import Image from 'next/image';
import { storage } from '../lib/appwrite'; // Assuming storage is exported from appwrite.js
import { useEffect, useState } from 'react';

// TODO: Replace with your actual Appwrite IDs if needed here, though ideally passed via props or context
const PROFILE_PHOTOS_BUCKET_ID = 'YOUR_PROFILE_PHOTOS_BUCKET_ID';

import Link from 'next/link'; // Import Link

// Add showViewChoresLink and progressPercent to props
export default function KidCard({ kid, onEdit, onDelete, showViewChoresLink = false, progressPercent }) {
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (kid) {
      if (kid.default_avatar_used || kid.photo_url.startsWith('/avatars/')) {
        setPhotoUrl(kid.photo_url);
      } else if (kid.photo_url) {
        // It's an Appwrite File ID
        try {
          const result = storage.getFilePreview(PROFILE_PHOTOS_BUCKET_ID, kid.photo_url);
          setPhotoUrl(result.href);
        } catch (error) {
          console.error('Error fetching file preview:', error);
          // Fallback to a default avatar if preview fails
          setPhotoUrl('/avatars/avatar1.svg'); 
        }
      } else {
        // Fallback if no photo_url
        setPhotoUrl('/avatars/avatar1.svg');
      }
    }
  }, [kid]);

  if (!kid) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 m-2 flex flex-col items-center transform transition-all hover:scale-105">
      <div className="w-32 h-32 relative mb-4 rounded-full overflow-hidden border-4 border-pink-300">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={kid.name || 'Kid avatar'}
            width={128}
            height={128}
            className="object-cover"
            priority // Good for LCP if these are primary content
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm text-gray-500">No image</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold text-purple-600 mb-2">{kid.name}</h3>
      
      {/* Progress Display */}
      {typeof progressPercent === 'number' && (
        <div className="w-full my-2">
          <p className="text-xs text-gray-600 mb-0.5">Today's Progress: {progressPercent.toFixed(0)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }} // Ensure width is between 0 and 100
            ></div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-2 mt-auto w-full pt-2"> {/* Added pt-2 for spacing */}
        {showViewChoresLink && (
          <Link
            href={`/view-kid-chores/${kid.$id}`} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
          >
            View Chores
          </Link>
        )}
        {/* Conditionally render Edit/Delete if onEdit/onDelete are provided, useful for dashboard view */}
        {onEdit && onDelete && (
          <div className="flex space-x-2 w-full">
            <button
              onClick={() => onEdit(kid)}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(kid.$id, kid.default_avatar_used ? null : kid.photo_url)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
