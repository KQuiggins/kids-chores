'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation'; // To get kidId from URL
import { databases, Query } from '../../lib/appwrite';
import KidAssignedChoreCard from '../../components/KidAssignedChoreCard';
import Image from 'next/image';

// TODO: Replace with your actual Appwrite IDs!
const DATABASE_ID = 'YOUR_APPWRITE_DATABASE_ID'; 
const ASSIGNMENTS_COLLECTION_ID = 'YOUR_ASSIGNMENTS_COLLECTION_ID';
const CHORES_COLLECTION_ID = 'YOUR_CHORES_COLLECTION_ID'; 
const KIDS_COLLECTION_ID = 'YOUR_KIDS_COLLECTION_ID';
const PROFILE_PHOTOS_BUCKET_ID = 'YOUR_PROFILE_PHOTOS_BUCKET_ID'; // From previous setup

export default function ViewKidChoresPage() {
  const pathname = usePathname();
  const kidId = pathname ? pathname.split('/').pop() : null;

  const [kidDetails, setKidDetails] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [choresDetails, setChoresDetails] = useState({}); // Store chore details by chore_id
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [kidPhotoUrl, setKidPhotoUrl] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);


  const fetchAllChoresDetails = useCallback(async (assignmentList) => {
    if (assignmentList.length === 0) return {};
    const choreIds = [...new Set(assignmentList.map(a => a.chore_id))];
    if (choreIds.length === 0) return {};

    try {
      const response = await databases.listDocuments(DATABASE_ID, CHORES_COLLECTION_ID, [
        Query.equal('$id', choreIds) // Query by document ID (chore_id is the $id of chore document)
      ]);
      const details = {};
      response.documents.forEach(doc => {
        details[doc.$id] = doc;
      });
      return details;
    } catch (err) {
      console.error('Failed to fetch chore details:', err);
      setError(prev => prev + ' Failed to fetch some chore details.');
      return {};
    }
  }, []);

  const fetchKidDataAndAssignments = useCallback(async () => {
    if (!kidId) {
      setError('Kid ID not found in URL.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Fetch Kid Details
      const kidDoc = await databases.getDocument(DATABASE_ID, KIDS_COLLECTION_ID, kidId);
      setKidDetails(kidDoc);
      
      // Set kid photo URL (logic adapted from KidCard)
      if (kidDoc.default_avatar_used || kidDoc.photo_url.startsWith('/avatars/')) {
        setKidPhotoUrl(kidDoc.photo_url);
      } else if (kidDoc.photo_url) {
        // It's an Appwrite File ID
        try {
          const result = databases.storage.getFilePreview(PROFILE_PHOTOS_BUCKET_ID, kidDoc.photo_url); // Corrected: storage is part of databases instance if not directly imported
          setKidPhotoUrl(result.href);
        } catch (previewError) {
          console.error('Error fetching kid photo preview:', previewError);
          setKidPhotoUrl('/avatars/avatar1.svg'); // Fallback
        }
      } else {
        setKidPhotoUrl('/avatars/avatar1.svg'); // Fallback
      }


      // Fetch Assignments for the kid
      // For date filtering, Appwrite expects ISO 8601.
      // To filter for a specific day, we need a range from start to end of that day.
      const dateStart = new Date(filterDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(filterDate);
      dateEnd.setHours(23, 59, 59, 999);

      const assignmentResponse = await databases.listDocuments(
        DATABASE_ID,
        ASSIGNMENTS_COLLECTION_ID,
        [
          Query.equal('kid_id', kidId),
          Query.greaterThanEqual('date', dateStart.toISOString()),
          Query.lessThanEqual('date', dateEnd.toISOString()),
          Query.orderDesc('date') // Show most recent first if not filtering by specific date
        ]
      );
      
      const fetchedAssignments = assignmentResponse.documents;
      setAssignments(fetchedAssignments);

      // Calculate progress for the current assignments
      if (fetchedAssignments.length > 0) {
        const doneCount = fetchedAssignments.filter(a => a.status === 'done').length;
        setProgressPercent((doneCount / fetchedAssignments.length) * 100);
        const choreDetailsMap = await fetchAllChoresDetails(fetchedAssignments);
        setChoresDetails(choreDetailsMap);
      } else {
        setProgressPercent(0);
        setChoresDetails({});
      }

    } catch (err) {
      console.error('Failed to fetch kid data or assignments:', err);
      setError(`Failed to load data: ${err.message}. Check Appwrite IDs and permissions.`);
      setKidDetails(null);
      setAssignments([]);
      setChoresDetails({});
    } finally {
      setIsLoading(false);
    }
  }, [kidId, fetchAllChoresDetails, filterDate]);

  useEffect(() => {
    fetchKidDataAndAssignments();
  }, [kidId, fetchKidDataAndAssignments]); // Rerun if kidId or filterDate changes

  const handleToggleComplete = async (assignmentId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    // Optimistically update UI
    setAssignments(prevAssignments => 
      prevAssignments.map(a => a.$id === assignmentId ? { ...a, status: newStatus } : a)
    );

    try {
      await databases.updateDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, assignmentId, { status: newStatus });
      // Optionally re-fetch or just rely on optimistic update. For simplicity, we do.
      // fetchKidDataAndAssignments(); // Re-fetch to ensure consistency if needed
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      setError('Failed to update chore status. Please try again.');
      // Revert optimistic update on error
      setAssignments(prevAssignments =>
        prevAssignments.map(a => a.$id === assignmentId ? { ...a, status: currentStatus } : a)
      );
    }
  };
  
  const getChoreDetail = (choreId) => {
    return choresDetails[choreId] || { title: 'Loading chore...', description: '' };
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen">
      {isLoading && !kidDetails && <p className="text-center text-orange-500 text-xl">Loading kid's chores...</p>}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {kidDetails && (
        <header className="text-center py-8 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 relative mx-auto mb-4 rounded-full overflow-hidden border-4 border-orange-300">
            {kidPhotoUrl ? (
              <Image
                src={kidPhotoUrl}
                alt={kidDetails.name || 'Kid avatar'}
                width={128}
                height={128}
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200"></div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-orange-600">Chores for {kidDetails.name}</h1>
          <div className="mt-4">
            <label htmlFor="filterDate" className="mr-2 text-orange-700">Filter by Date:</label>
            <input 
              type="date" 
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          {/* Progress Display for the selected date */}
          <div className="w-full max-w-md mx-auto my-4">
            <p className="text-sm text-orange-700 mb-1 text-center">
              Progress for {new Date(filterDate).toLocaleDateString()}: {progressPercent.toFixed(0)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3.5 dark:bg-gray-700">
              <div 
                className="bg-green-500 h-3.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              ></div>
            </div>
          </div>
        </header>
      )}

      {!isLoading && !error && assignments.length === 0 && kidDetails && (
        <p className="text-center text-gray-500 text-lg">
          No chores assigned for {kidDetails.name} on {new Date(filterDate).toLocaleDateString()}.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {assignments.map((assignment) => (
          <KidAssignedChoreCard
            key={assignment.$id}
            assignment={assignment}
            choreDetails={getChoreDetail(assignment.chore_id)}
            onToggleComplete={handleToggleComplete}
            isLoading={isLoading} // You might want a more granular loading state per card
          />
        ))}
      </div>
      
      { (DATABASE_ID.startsWith('YOUR_') || ASSIGNMENTS_COLLECTION_ID.startsWith('YOUR_') || CHORES_COLLECTION_ID.startsWith('YOUR_') || KIDS_COLLECTION_ID.startsWith('YOUR_')) && (
         <div className="fixed bottom-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-800 border-t border-yellow-400">
            <strong>Reminder:</strong> Please replace placeholder Appwrite IDs in <code>app/view-kid-chores/[kidId]/page.js</code> with your actual Appwrite project values.
         </div>
       )}
    </div>
  );
}
