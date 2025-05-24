'use server';

import { databases, storage } from '@/app/lib/appwrite';
import { ID } from 'appwrite';

const DATABASE_ID = process.env.DATABASE_ID;
const KIDS_COLLECTION_ID = process.env.KIDS_COLLECTION_ID;
const PROFILE_PHOTOS_BUCKET_ID = process.env.PROFILE_PHOTOS_BUCKET_ID;

export async function fetchKids() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, KIDS_COLLECTION_ID);
    return {
      success: true,
      kids: response.documents
    };
  } catch (error) {
    console.error('Failed to fetch kids:', error);
    return {
      success: false,
      error: 'Failed to load kids. Please ensure Appwrite is configured correctly (Database ID, Collection ID).'
    };
  }
}

export async function createKid(kidData) {
  try {
    let photoUrl = kidData.photo_url;
    let defaultAvatarUsed = kidData.default_avatar_used;

    // Handle custom photo upload
    if (kidData.customPhotoFile) {
      const file = kidData.customPhotoFile;
      const fileResponse = await storage.createFile(PROFILE_PHOTOS_BUCKET_ID, ID.unique(), file);
      photoUrl = fileResponse.$id;
      defaultAvatarUsed = false;
    }

    const dataPayload = {
      name: kidData.name,
      photo_url: photoUrl,
      default_avatar_used: defaultAvatarUsed,
    };

    await databases.createDocument(DATABASE_ID, KIDS_COLLECTION_ID, ID.unique(), dataPayload);

    return { success: true };
  } catch (error) {
    console.error('Failed to create kid:', error);
    return {
      success: false,
      error: `Failed to save kid: ${error.message}. Check Appwrite configuration and bucket permissions.`
    };
  }
}

export async function updateKid(kidId, kidData, existingKidData) {
  try {
    let photoUrl = kidData.photo_url;
    let defaultAvatarUsed = kidData.default_avatar_used;
    let existingPhotoFileId = null;

    if (existingKidData && !existingKidData.default_avatar_used && existingKidData.photo_url) {
      existingPhotoFileId = existingKidData.photo_url;
    }

    // Handle custom photo upload
    if (kidData.customPhotoFile) {
      const file = kidData.customPhotoFile;
      const fileResponse = await storage.createFile(PROFILE_PHOTOS_BUCKET_ID, ID.unique(), file);
      photoUrl = fileResponse.$id;
      defaultAvatarUsed = false;

      // Delete old photo if it exists
      if (existingPhotoFileId && existingPhotoFileId !== photoUrl) {
        try {
          await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
        } catch (deleteError) {
          console.warn('Failed to delete old photo:', deleteError);
        }
      }
    } else if (kidData.default_avatar_used) {
      photoUrl = kidData.photo_url;
      defaultAvatarUsed = true;

      // Delete existing custom photo if switching to default
      if (existingPhotoFileId) {
        try {
          await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
        } catch (deleteError) {
          console.warn('Failed to delete old photo on switching to default:', deleteError);
        }
      }
    } else if (existingKidData) {
      // Keep existing photo
      photoUrl = existingKidData.photo_url;
      defaultAvatarUsed = existingKidData.default_avatar_used;
    }

    const dataPayload = {
      name: kidData.name,
      photo_url: photoUrl,
      default_avatar_used: defaultAvatarUsed,
    };

    await databases.updateDocument(DATABASE_ID, KIDS_COLLECTION_ID, kidId, dataPayload);

    return { success: true };
  } catch (error) {
    console.error('Failed to update kid:', error);
    return {
      success: false,
      error: `Failed to save kid: ${error.message}. Check Appwrite configuration and bucket permissions.`
    };
  }
}

export async function deleteKid(kidId, photoFileIdToDelete) {
  try {
    // Delete photo from storage if it exists
    if (photoFileIdToDelete) {
      try {
        await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, photoFileIdToDelete);
      } catch (deleteError) {
        console.warn('Failed to delete photo from storage, but will attempt to delete document:', deleteError);
      }
    }

    // Delete kid document
    await databases.deleteDocument(DATABASE_ID, KIDS_COLLECTION_ID, kidId);

    return { success: true };
  } catch (error) {
    console.error('Failed to delete kid:', error);
    return {
      success: false,
      error: `Failed to delete kid: ${error.message}`
    };
  }
}
