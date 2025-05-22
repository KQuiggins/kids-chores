'use client';

import { useState, useEffect } from 'react';
import { databases, storage, ID } from '../lib/appwrite'; // Assuming client is implicitly used by these services
import KidsList from '../components/KidsList';
import KidForm from '../components/KidForm';
import Image from 'next/image'; // Used for form preview, potentially KidCard if not already there

// TODO: Replace with your actual Appwrite IDs!
// Find these in your Appwrite project console.
// Database ID: Navigate to Databases, select your database, its ID is in the settings.
// Collection ID: Inside your database, select the 'kids' collection, its ID is in the settings.
// Bucket ID: Navigate to Storage, select your 'profile_photos' bucket, its ID is in the settings.
const DATABASE_ID = 'YOUR_APPWRITE_DATABASE_ID'; 
const KIDS_COLLECTION_ID = 'YOUR_KIDS_COLLECTION_ID';
const PROFILE_PHOTOS_BUCKET_ID = 'YOUR_PROFILE_PHOTOS_BUCKET_ID';

const availableAvatars = ['/avatars/avatar1.svg', '/avatars/avatar2.svg', '/avatars/avatar3.svg'];

export default function ManageKidsPage() {
  const [kids, setKids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKidForm, setShowKidForm] = useState(false);
  const [editingKidData, setEditingKidData] = useState(null);
  const [error, setError] = useState('');

  async function fetchKids() {
    setIsLoading(true);
    setError('');
    try {
      const response = await databases.listDocuments(DATABASE_ID, KIDS_COLLECTION_ID);
      setKids(response.documents);
    } catch (error) {
      console.error('Failed to fetch kids:', error);
      setError('Failed to load kids. Please ensure Appwrite is configured correctly (Database ID, Collection ID).');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchKids();
  }, []);

  const handleAddKidClick = () => {
    setEditingKidData(null);
    setShowKidForm(true);
    setError('');
  };

  const handleEditKid = (kid) => {
    setEditingKidData(kid);
    setShowKidForm(true);
    setError('');
  };

  const handleCancelForm = () => {
    setShowKidForm(false);
    setEditingKidData(null);
    setError('');
  };

  const handleSubmitKid = async (kidData, kidIdToUpdate) => {
    setIsLoading(true);
    setError('');
    try {
      let photoUrl = kidData.photo_url;
      let defaultAvatarUsed = kidData.default_avatar_used;
      let existingPhotoFileId = null;

      if (kidIdToUpdate && editingKidData && !editingKidData.default_avatar_used && editingKidData.photo_url) {
        existingPhotoFileId = editingKidData.photo_url; // This is the Appwrite File ID
      }

      // Handle photo upload if a new custom photo is provided
      if (kidData.customPhotoFile) {
        // 1. Upload new photo
        const file = kidData.customPhotoFile;
        const fileResponse = await storage.createFile(PROFILE_PHOTOS_BUCKET_ID, ID.unique(), file);
        photoUrl = fileResponse.$id; // Store the File ID
        defaultAvatarUsed = false;

        // 2. If editing and there was an old custom photo, delete it
        if (existingPhotoFileId && existingPhotoFileId !== photoUrl) {
          try {
            await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
          } catch (deleteError) {
            console.warn('Failed to delete old photo:', deleteError);
            // Non-critical, proceed with updating/creating the kid document
          }
        }
      } else if (kidData.default_avatar_used) { // A default avatar was selected
        photoUrl = kidData.photo_url; // Path like /avatars/avatar1.svg
        defaultAvatarUsed = true;
        // If editing and switched from custom photo to default avatar, delete the old custom photo
        if (existingPhotoFileId) {
           try {
            await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
          } catch (deleteError) {
            console.warn('Failed to delete old photo on switching to default:', deleteError);
          }
        }
      } else if (kidIdToUpdate && editingKidData) {
        // No new photo, no new default avatar selected, retain existing photo info
        photoUrl = editingKidData.photo_url;
        defaultAvatarUsed = editingKidData.default_avatar_used;
      }


      const dataPayload = {
        name: kidData.name,
        photo_url: photoUrl,
        default_avatar_used: defaultAvatarUsed,
        // created_at is handled by Appwrite ($createdAt)
      };
      
      if (kidIdToUpdate) {
        // Update existing kid
        await databases.updateDocument(DATABASE_ID, KIDS_COLLECTION_ID, kidIdToUpdate, dataPayload);
      } else {
        // Add new kid (ensure created_at is part of your collection attributes if you manually manage it)
        // Appwrite's $createdAt is automatic. If you have a manual 'created_at' field, add it here.
        // For this example, we assume $createdAt is sufficient.
        await databases.createDocument(DATABASE_ID, KIDS_COLLECTION_ID, ID.unique(), dataPayload);
      }

      await fetchKids(); // Refresh list
      setShowKidForm(false);
      setEditingKidData(null);
    } catch (error) {
      console.error('Failed to save kid:', error);
      setError(`Failed to save kid: ${error.message}. Check Appwrite configuration and bucket permissions.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKid = async (kidId, photoFileIdToDelete) => {
    if (!confirm('Are you sure you want to delete this kid?')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // If there's a custom photo stored in Appwrite Storage, delete it first
      if (photoFileIdToDelete) { // photoFileIdToDelete is the Appwrite File ID
        try {
          await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, photoFileIdToDelete);
        } catch (deleteError) {
            console.warn('Failed to delete photo from storage, but will attempt to delete document:', deleteError);
            // Proceed to delete the document even if photo deletion fails
        }
      }
      
      await databases.deleteDocument(DATABASE_ID, KIDS_COLLECTION_ID, kidId);
      await fetchKids(); // Refresh list
    } catch (error) {
      console.error('Failed to delete kid:', error);
      setError(`Failed to delete kid: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-100 to-pink-100 min-h-screen">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-purple-700">Manage Your Kids</h1>
        <p className="text-lg text-purple-500 mt-2">Add, edit, or remove kid profiles.</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!showKidForm ? (
        <>
          <div className="text-center mb-8">
            <button
              onClick={handleAddKidClick}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Add New Kid
            </button>
          </div>
          {isLoading && !kids.length ? ( // Show loading only if no kids are displayed yet
            <p className="text-center text-purple-500 text-xl">Loading kids...</p>
          ) : (
            <KidsList kids={kids} onEditKid={handleEditKid} onDeleteKid={handleDeleteKid} />
          )}
        </>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-semibold text-purple-600 mb-6 text-center">
            {editingKidData ? 'Edit Kid' : 'Add New Kid'}
          </h2>
          <KidForm
            onSubmitKid={handleSubmitKid}
            initialData={editingKidData}
            onCancel={handleCancelForm}
            // availableAvatars prop is not explicitly needed by KidForm as it's hardcoded there
            // but if it were passed: availableAvatars={availableAvatars} 
          />
        </div>
      )}
       {/* Reminder for Appwrite IDs */}
       { (DATABASE_ID.startsWith('YOUR_') || KIDS_COLLECTION_ID.startsWith('YOUR_') || PROFILE_PHOTOS_BUCKET_ID.startsWith('YOUR_')) && (
         <div className="fixed bottom-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-800 border-t border-yellow-400">
            <strong>Reminder:</strong> Please replace placeholder Appwrite IDs (<code>DATABASE_ID</code>, <code>KIDS_COLLECTION_ID</code>, <code>PROFILE_PHOTOS_BUCKET_ID</code>) in <code>app/manage-kids/page.js</code> with your actual Appwrite project values.
         </div>
       )}
    </div>
  );
}
