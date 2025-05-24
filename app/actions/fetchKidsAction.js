'use server';

import { databases, storage } from '@/app/lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.DATABASE_ID;
const KIDS_COLLECTION_ID = process.env.KIDS_COLLECTION_ID;
const ASSIGNMENTS_COLLECTION_ID = process.env.ASSIGNMENTS_COLLECTION_ID;
const PROFILE_PHOTOS_BUCKET_ID = process.env.PROFILE_PHOTOS_BUCKET_ID;

export async function fetchKidsWithProgress() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, KIDS_COLLECTION_ID);
    const kids = response.documents;

    // Get today's date for progress calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const kidsWithProgress = await Promise.all(
      kids.map(async (kid) => {
        try {
          // Fetch today's assignments for this kid
          const assignmentsResponse = await databases.listDocuments(
            DATABASE_ID,
            ASSIGNMENTS_COLLECTION_ID,
            [
              Query.equal('kid_id', kid.$id),
              Query.greaterThanEqual('date', today.toISOString()),
              Query.lessThanEqual('date', endOfDay.toISOString())
            ]
          );

          const assignments = assignmentsResponse.documents;
          const doneCount = assignments.filter(a => a.status === 'done').length;
          const progressPercent = assignments.length > 0 ? (doneCount / assignments.length) * 100 : 0;

          // Handle photo URL
          let photoUrl = '';
          if (kid.default_avatar_used || kid.photo_url.startsWith('/avatars/')) {
            photoUrl = kid.photo_url;
          } else if (kid.photo_url) {
            try {
              const result = storage.getFilePreview(PROFILE_PHOTOS_BUCKET_ID, kid.photo_url);
              photoUrl = result.href;
            } catch (previewError) {
              console.error('Error fetching photo preview for kid:', kid.$id, previewError);
              photoUrl = '/avatars/avatar1.svg';
            }
          } else {
            photoUrl = '/avatars/avatar1.svg';
          }

          return {
            ...kid,
            photoUrl,
            progressPercent
          };
        } catch (error) {
          console.error('Error processing kid:', kid.$id, error);
          return {
            ...kid,
            photoUrl: '/avatars/avatar1.svg',
            progressPercent: 0
          };
        }
      })
    );

    return {
      success: true,
      kids: kidsWithProgress
    };
  } catch (error) {
    console.error('Failed to fetch kids:', error);
    return {
      success: false,
      error: `Failed to load kids: ${error.message}`
    };
  }
}
