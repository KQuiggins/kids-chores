'use server';

import { databases } from '@/app/lib/appwrite';
import { ID } from 'appwrite';

// Helper function to ensure data is plain and serializable
function toPlainObject(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.error("Failed to serialize value:", error);
    // Fallback or re-throw, depending on how critical this is.
    // For now, returning a string representation or an error object.
    return { serializationError: `Failed to serialize: ${error.message}` };
  }
}

const DATABASE_ID = process.env.DATABASE_ID;
const CHORES_COLLECTION_ID = process.env.CHORES_COLLECTION_ID;
// at top of app/actions/fetchChoreAction.js
console.log("Using DB:", process.env.DATABASE_ID, "COL:", process.env.CHORES_COLLECTION_ID);


export async function fetchChores() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, CHORES_COLLECTION_ID);
    return { success: true, documents: toPlainObject(response.documents) };
  } catch (error) {
    console.error('Failed to fetch chores:', error);
    const errorMessage = `Failed to load chores. Please ensure Appwrite is configured correctly. Raw error: ${error.message}`;
    return { success: false, error: toPlainObject(errorMessage) };
  }
}

export async function createChore(formData) {
  try {
    const title = formData.get('title');
    const description = formData.get('description');
    const frequency = formData.get('frequency');

    const dataPayload = {
      title,
      description,
      frequency,
    };

    await databases.createDocument(DATABASE_ID, CHORES_COLLECTION_ID, ID.unique(), dataPayload);
    return { success: true };
  } catch (error) {
    console.error('Failed to create chore:', error);
    return { success: false, error: `Failed to save chore: ${error.message}` };
  }
}

export async function updateChore(choreId, formData) {
  try {
    const title = formData.get('title');
    const description = formData.get('description');
    const frequency = formData.get('frequency');

    const dataPayload = {
      title,
      description,
      frequency,
    };

    await databases.updateDocument(DATABASE_ID, CHORES_COLLECTION_ID, choreId, dataPayload);
    return { success: true };
  } catch (error) {
    console.error('Failed to update chore:', error);
    return { success: false, error: `Failed to save chore: ${error.message}` };
  }
}

export async function deleteChore(choreId) {
  try {
    await databases.deleteDocument(DATABASE_ID, CHORES_COLLECTION_ID, choreId);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete chore:', error);
    return { success: false, error: `Failed to delete chore: ${error.message}` };
  }
}
