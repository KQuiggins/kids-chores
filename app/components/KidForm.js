'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { createKid, updateKid } from '@/app/actions/manageKidsAction';

const availableAvatars = ['/avatars/avatar1.svg', '/avatars/avatar2.svg', '/avatars/avatar3.svg'];

const initialState = { message: null, error: null, success: false };

function SubmitButton({ initialData }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
    >
      {pending ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Kid')}
    </button>
  );
}

export default function KidForm({ initialData, onCancel }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(''); // Path of selected default avatar
  const [customPhotoFile, setCustomPhotoFile] = useState(null); // File object for new upload
  const [customPhotoPreview, setCustomPhotoPreview] = useState('');

  const serverAction = initialData ? updateKid.bind(null, initialData.$id) : createKid;
  const [state, formAction] = useFormState(serverAction, initialState);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      if (initialData.default_avatar_used && initialData.photo_url) {
        setSelectedAvatar(initialData.photo_url);
        setCustomPhotoFile(null);
        setCustomPhotoPreview('');
      } else if (!initialData.default_avatar_used && initialData.photo_url) {
        setSelectedAvatar('');
        setCustomPhotoFile(null);
        setCustomPhotoPreview(''); // No preview for existing custom photo for simplicity
      } else { // covers cases like initialData.photo_url being null or empty
        setName(initialData.name || ''); // Keep name if present
        setSelectedAvatar(availableAvatars[0]); // Default avatar
        setCustomPhotoFile(null);
        setCustomPhotoPreview('');
      }
    } else {
      // New kid form defaults
      setName('');
      setSelectedAvatar(availableAvatars[0]);
      setCustomPhotoFile(null);
      setCustomPhotoPreview('');
    }
  }, [initialData]);

  useEffect(() => {
    if (state.success && onCancel) {
      onCancel(); 
    }
  }, [state.success, onCancel]);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomPhotoFile(file); 
      setCustomPhotoPreview(URL.createObjectURL(file));
      setSelectedAvatar(''); // Clear selected default avatar path
    }
  };

  const handleAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setCustomPhotoFile(null); 
    const customPhotoInputElement = document.getElementById('customPhotoFile');
    if (customPhotoInputElement) {
        customPhotoInputElement.value = ''; // Clear the file input field display
    }
    setCustomPhotoPreview('');
  };
  
  // This derived state determines the value for the hidden 'default_avatar_used' field.
  // It's 'true' if a default avatar is selected AND no new custom photo is staged.
  // It's 'false' if a new custom photo is staged.
  const defaultAvatarUsedValue = (selectedAvatar && !customPhotoFile) ? 'true' : 'false';

  return (
    <form action={formAction} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Kid's Name
        </label>
        <input
          type="text"
          id="name"
          name="name" 
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
            <label key={avatar} className={`relative w-20 h-20 rounded-full overflow-hidden border-4 cursor-pointer ${selectedAvatar === avatar && !customPhotoFile ? 'border-purple-500 ring-2 ring-purple-500' : 'border-transparent hover:border-gray-300'}`}>
              <input
                type="radio"
                name="photo_url" // This will carry the path of the selected default avatar
                value={avatar}
                checked={selectedAvatar === avatar && !customPhotoFile} // Only checked if it's the selected one AND no custom file is chosen
                onChange={() => handleAvatarSelect(avatar)}
                className="sr-only" 
              />
              <Image src={avatar} alt={`Avatar ${avatar}`} width={80} height={80} className="object-cover" />
            </label>
          ))}
        </div>
      </div>
      
      {/* This hidden input tells the server if the 'photo_url' field (default avatar path) should be used, or if there's a custom file */}
      <input type="hidden" name="default_avatar_used" value={defaultAvatarUsedValue} />

      <div>
        <label htmlFor="customPhotoFile" className="block text-sm font-medium text-gray-700 mb-1">
          Or Upload a Custom Photo
        </label>
        <input
          type="file"
          id="customPhotoFile"
          name="customPhotoFile" // This field sends the actual file data
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        {customPhotoPreview && (
          <div className="mt-4 w-32 h-32 relative rounded-full overflow-hidden border-2 border-purple-300">
            <Image src={customPhotoPreview} alt="Custom photo preview" layout="fill" className="object-cover" />
          </div>
        )}
        {/* Informative text if editing and an existing custom photo is present but no new one is selected yet */}
        {!customPhotoPreview && initialData && !initialData.default_avatar_used && initialData.photo_url && (
           <div className="mt-4 text-sm text-gray-500">
             Currently using a custom photo. Upload a new one or select a default avatar to change it.
           </div>
        )}
      </div>

      {/* Hidden fields for update logic in server action */}
      {initialData && (
        <>
          <input type="hidden" name="existingPhotoUrl" value={initialData.photo_url || ''} />
          <input type="hidden" name="existingDefaultAvatarUsed" value={String(initialData.default_avatar_used)} />
        </>
      )}

      {/* Display messages from server action state */}
      {state.message && !state.error && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-yellow-600'}`}>{state.message}</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel} 
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <SubmitButton initialData={initialData} />
      </div>
    </form>
  );
}
