'use server';

import { databases } from '@/app/lib/appwrite';
import { Query, ID } from 'appwrite';

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
      kids: toPlainObject(kidsResponse.documents),
      chores: toPlainObject(choresResponse.documents)
    };
  } catch (error) {
    console.error('Failed to fetch kids or chores:', error);
    const errorMessage = `Failed to load data: ${error.message}. Check Appwrite IDs and permissions.`;
    return {
      success: false,
      error: toPlainObject(errorMessage)
    };
  }
}

export async function createAssignments(formData) {
  try {
    const kidIds = formData.getAll('kidIds');
    const choreIds = formData.getAll('choreIds');
    const assignmentDateString = formData.get('assignmentDate');

    if (!assignmentDateString) {
      return { success: false, error: "Assignment date is missing." };
    }
    if (!kidIds || kidIds.length === 0) {
        return { success: false, error: "No kids selected for assignment." };
    }
    if (!choreIds || choreIds.length === 0) {
        return { success: false, error: "No chores selected for assignment." };
    }
    
    const formattedAssignmentDate = new Date(assignmentDateString).toISOString();

    const assignmentsData = [];
    for (const kid_id of kidIds) {
      for (const chore_id of choreIds) {
        assignmentsData.push({
          kid_id,
          chore_id,
          date: formattedAssignmentDate,
          status: 'pending'
        });
      }
    }

    if (assignmentsData.length === 0) {
        return { success: false, error: "No assignments to create. Please select kids and chores." };
    }

    let createdCount = 0;
    const errors = [];

    const creationPromises = assignmentsData.map(async (assignment) => {
      try {
        // Payload is already the assignment object itself
        await databases.createDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, ID.unique(), assignment);
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
      // Ensure errors array is not empty before joining, or provide a generic message
      const errorMsg = errors.length > 0 ? errors.join(', ') : 'Unknown errors occurred.';
      return {
        success: false,
        error: `Failed to assign chores. Errors: ${errorMsg}`
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
