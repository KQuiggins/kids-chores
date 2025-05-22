'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const availableAvatars = ['/avatars/avatar1.svg', '/avatars/avatar2.svg', '/avatars/avatar3.svg'];

export default function KidForm({ onSubmitKid, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customPhoto, setCustomPhoto] = useState(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      if (initialData.default_avatar_used && initialData.photo_url) {
        setSelectedAvatar(initialData.photo_url);
        setCustomPhoto(null);
        setCustomPhotoPreview('');
      } else if (!initialData.default_avatar_used && initialData.photo_url) {
        // Assuming initialData.photo_url is an Appwrite File ID if not a default avatar
        // For simplicity, we don't pre-fill the file input or show preview of existing Appwrite image
        // User will have to re-select if they want to change it, or keep it.
        setSelectedAvatar(''); // Clear default avatar selection
        // Previewing Appwrite images here would require async call to storage.getFilePreview
        // For now, if editing, we assume the photo is kept unless a new one or default avatar is chosen
      }
    } else {
      // New kid form defaults
      setName('');
      setSelectedAvatar(availableAvatars[0]); // Default to first avatar
      setCustomPhoto(null);
      setCustomPhotoPreview('');
    }
  }, [initialData]);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomPhoto(file);
      setCustomPhotoPreview(URL.createObjectURL(file));
      setSelectedAvatar(''); // Clear selected default avatar
    }
  };

  const handleAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setCustomPhoto(null);
    setCustomPhotoPreview('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    if (!selectedAvatar && !customPhoto && !initialData?.photo_url) {
      alert('Please select an avatar or upload a photo.');
      return;
    }

    const kidData = {
      name: name.trim(),
      photo_url: selectedAvatar, // Will be default avatar path or Appwrite File ID (set in parent)
      default_avatar_used: !!selectedAvatar,
      customPhotoFile: customPhoto, // Pass the file object for parent to handle upload
    };
    
    // If editing and no new photo/avatar is selected, retain original photo info
    if (initialData && !selectedAvatar && !customPhoto) {
        kidData.photo_url = initialData.photo_url;
        kidData.default_avatar_used = initialData.default_avatar_used;
    }
    
    onSubmitKid(kidData, initialData ? initialData.$id : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Kid's Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Choose an Avatar</p>
        <div className="flex space-x-4 mb-4">
          {availableAvatars.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => handleAvatarSelect(avatar)}
              className={`w-20 h-20 rounded-full overflow-hidden border-4 ${selectedAvatar === avatar ? 'border-purple-500 ring-2 ring-purple-500' : 'border-transparent hover:border-gray-300'}`}
            >
              <Image src={avatar} alt={`Avatar ${avatar}`} width={80} height={80} className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="customPhoto" className="block text-sm font-medium text-gray-700 mb-1">
          Or Upload a Custom Photo
        </label>
        <input
          type="file"
          id="customPhoto"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        {customPhotoPreview && (
          <div className="mt-4 w-32 h-32 relative rounded-full overflow-hidden border-2 border-purple-300">
            <Image src={customPhotoPreview} alt="Custom photo preview" layout="fill" className="object-cover" />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          {initialData ? 'Save Changes' : 'Add Kid'}
        </button>
      </div>
    </form>
  );
}
