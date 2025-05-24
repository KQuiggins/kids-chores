'use server';

import { databases } from '@/app/lib/appwrite';
import { ID } from 'appwrite';

const DATABASE_ID = process.env.DATABASE_ID;
const CHORES_COLLECTION_ID = process.env.CHORES_COLLECTION_ID;
// at top of app/actions/fetchChoreAction.js
console.log("Using DB:", process.env.DATABASE_ID, "COL:", process.env.CHORES_COLLECTION_ID);


export async function fetchChores() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, CHORES_COLLECTION_ID);
    return { success: true, documents: response.documents };
  } catch (error) {
    console.error('Failed to fetch chores:', error);
    return { success: false, error: 'Failed to load chores. Please ensure Appwrite is configured correctly.' };
  }
}

export async function createChore(choreData) {
  try {
    const dataPayload = {
      title: choreData.title,
      description: choreData.description,
      frequency: choreData.frequency,
    };

    await databases.createDocument(DATABASE_ID, CHORES_COLLECTION_ID, ID.unique(), dataPayload);
    return { success: true };
  } catch (error) {
    console.error('Failed to create chore:', error);
    return { success: false, error: `Failed to save chore: ${error.message}` };
  }
}

export async function updateChore(choreId, choreData) {
  try {
    const dataPayload = {
      title: choreData.title,
      description: choreData.description,
      frequency: choreData.frequency,
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
