'use server';

import { databases } from '@/app/lib/appwrite';
import { Query, ID } from 'appwrite';

const DATABASE_ID = process.env.DATABASE_ID;
const ASSIGNMENTS_COLLECTION_ID = process.env.ASSIGNMENTS_COLLECTION_ID;
const KIDS_COLLECTION_ID = process.env.KIDS_COLLECTION_ID;
const CHORES_COLLECTION_ID = process.env.CHORES_COLLECTION_ID;

export async function fetchKidsAndChores() {
  try {
    const [kidsResponse, choresResponse] = await Promise.all([
      databases.listDocuments(DATABASE_ID, KIDS_COLLECTION_ID, [Query.limit(100)]),
      databases.listDocuments(DATABASE_ID, CHORES_COLLECTION_ID, [Query.limit(100)])
    ]);

    return {
      success: true,
      kids: kidsResponse.documents,
      chores: choresResponse.documents
    };
  } catch (error) {
    console.error('Failed to fetch kids or chores:', error);
    return {
      success: false,
      error: `Failed to load data: ${error.message}. Check Appwrite IDs and permissions.`
    };
  }
}

export async function createAssignments(assignmentsData) {
  try {
    let createdCount = 0;
    const errors = [];

    const creationPromises = assignmentsData.map(async (assignment) => {
      try {
        const payload = {
          kid_id: assignment.kid_id,
          chore_id: assignment.chore_id,
          date: assignment.date,
          status: 'pending'
        };

        await databases.createDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, ID.unique(), payload);
        createdCount++;
        return { success: true };
      } catch (error) {
        console.error('Failed to create an assignment:', error);
        errors.push(error.message);
        return { success: false, error: error.message };
      }
    });

    await Promise.all(creationPromises);

    if (createdCount === assignmentsData.length) {
      return {
        success: true,
        message: `${createdCount} chore(s) assigned successfully!`
      };
    } else if (createdCount > 0) {
      return {
        success: true,
        message: `${createdCount} chore(s) assigned successfully!`,
        warning: `Some chores could not be assigned. ${assignmentsData.length - createdCount} failed.`
      };
    } else {
      return {
        success: false,
        error: `Failed to assign chores. Errors: ${errors.join(', ')}`
      };
    }
  } catch (error) {
    console.error('Error assigning chores:', error);
    return {
      success: false,
      error: `An unexpected error occurred during assignment: ${error.message}`
    };
  }
}
