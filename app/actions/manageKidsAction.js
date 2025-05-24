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

export async function createKid(formData) {
  try {
    const name = formData.get('name');
    const selectedAvatar = formData.get('photo_url'); // Path to default avatar if selected
    const defaultAvatarUsedStr = formData.get('default_avatar_used'); // Will be 'true' or 'false' string
    const customPhotoFile = formData.get('customPhotoFile'); // File object or null

    let photoUrl = selectedAvatar;
    let defaultAvatarUsed = defaultAvatarUsedStr === 'true';

    // Handle custom photo upload
    if (customPhotoFile && customPhotoFile.size > 0) {
      const fileResponse = await storage.createFile(PROFILE_PHOTOS_BUCKET_ID, ID.unique(), customPhotoFile);
      photoUrl = fileResponse.$id;
      defaultAvatarUsed = false;
    } else if (defaultAvatarUsedStr === 'true') {
      // Ensure photoUrl is set to the selected default avatar if default_avatar_used is true
      // and no custom file is uploaded.
      photoUrl = selectedAvatar;
    } else if (!selectedAvatar && !customPhotoFile) {
      // This case might indicate an issue or a kid being created without any photo.
      // Depending on requirements, you might want to set a placeholder or handle as an error.
      // For now, let it proceed, photoUrl might be null or empty.
      // defaultAvatarUsed would also be false in this scenario if not explicitly set to true.
      console.warn("Creating kid without a photo or default avatar selected.");
    }


    const dataPayload = {
      name: name,
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

export async function updateKid(kidId, formData) {
  try {
    const name = formData.get('name');
    const photo_url_selected = formData.get('photo_url'); // New selected default avatar path, if any
    const default_avatar_used_str = formData.get('default_avatar_used'); // String 'true' or 'false'
    const customPhotoFile = formData.get('customPhotoFile'); // New custom file, if any

    // Values from hidden fields representing the current state of the kid's photo
    const existingPhotoUrl = formData.get('existingPhotoUrl');
    const existingDefaultAvatarUsed = formData.get('existingDefaultAvatarUsed') === 'true';
    
    // Determine the actual file ID of the existing photo, if it's not a default avatar path
    const existingPhotoFileId = (!existingDefaultAvatarUsed && existingPhotoUrl && !existingPhotoUrl.startsWith('/avatars/')) ? existingPhotoUrl : null;

    let finalPhotoUrl = existingPhotoUrl;
    let finalDefaultAvatarUsed = existingDefaultAvatarUsed;

    // Handle custom photo upload
    if (customPhotoFile && customPhotoFile.size > 0) {
      const fileResponse = await storage.createFile(PROFILE_PHOTOS_BUCKET_ID, ID.unique(), customPhotoFile);
      finalPhotoUrl = fileResponse.$id;
      finalDefaultAvatarUsed = false;

      // Delete old custom photo if it exists and is different
      if (existingPhotoFileId && existingPhotoFileId !== finalPhotoUrl) {
        try {
          await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
        } catch (deleteError) {
          console.warn('Failed to delete old custom photo:', deleteError);
        }
      }
    } else if (default_avatar_used_str === 'true') {
      // Switching to or selecting a default avatar
      finalPhotoUrl = photo_url_selected; // Use the path of the selected default avatar
      finalDefaultAvatarUsed = true;

      // If there was an old custom photo, delete it
      if (existingPhotoFileId) {
        try {
          await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
        } catch (deleteError) {
          console.warn('Failed to delete old custom photo when switching to default:', deleteError);
        }
      }
    } else if (photo_url_selected && photo_url_selected !== existingPhotoUrl && default_avatar_used_str !== 'true' && !customPhotoFile) {
      // This condition handles the case where a new default avatar is selected,
      // but 'default_avatar_used' might not be explicitly 'true' (e.g. form logic implies it)
      // or if the user is unselecting a custom photo and selecting a new default avatar.
      // Essentially, if photo_url_selected is present, not a new custom file, and it's different from existing.
      finalPhotoUrl = photo_url_selected;
      finalDefaultAvatarUsed = true; // Selecting a new default avatar implies it's default
      if (existingPhotoFileId) {
         try {
          await storage.deleteFile(PROFILE_PHOTOS_BUCKET_ID, existingPhotoFileId);
        } catch (deleteError) {
          console.warn('Failed to delete old custom photo when selecting a new default avatar:', deleteError);
        }
      }
    }
    // If no new custom photo, not switching to default, and no new default avatar selected,
    // the existing photo (finalPhotoUrl, finalDefaultAvatarUsed) is kept.

    const dataPayload = {
      name: name,
      photo_url: finalPhotoUrl,
      default_avatar_used: finalDefaultAvatarUsed,
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
