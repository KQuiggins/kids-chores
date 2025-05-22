'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases, ID, Query } from '../lib/appwrite';
import AssignChoreForm from '../components/AssignChoreForm';

// TODO: Replace with your actual Appwrite IDs!
const DATABASE_ID = 'YOUR_APPWRITE_DATABASE_ID'; 
const ASSIGNMENTS_COLLECTION_ID = 'YOUR_ASSIGNMENTS_COLLECTION_ID';
const KIDS_COLLECTION_ID = 'YOUR_KIDS_COLLECTION_ID';
const CHORES_COLLECTION_ID = 'YOUR_CHORES_COLLECTION_ID';

export default function AssignChoresPage() {
  const [kids, setKids] = useState([]);
  const [chores, setChores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const [kidsResponse, choresResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, KIDS_COLLECTION_ID, [Query.limit(100)]), // Adjust limit as needed
        databases.listDocuments(DATABASE_ID, CHORES_COLLECTION_ID, [Query.limit(100)]) // Adjust limit as needed
      ]);
      setKids(kidsResponse.documents);
      setChores(choresResponse.documents);
    } catch (err) {
      console.error('Failed to fetch kids or chores:', err);
      setError(`Failed to load data: ${err.message}. Check Appwrite IDs and permissions.`);
      setKids([]);
      setChores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignChores = async (assignmentsData) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    let createdCount = 0;

    try {
      const creationPromises = assignmentsData.map(assignment => {
        // Ensure date is correctly formatted (AssignChoreForm should already do this)
        const payload = {
          kid_id: assignment.kid_id,
          chore_id: assignment.chore_id,
          date: assignment.date, // Expecting ISO string
          status: 'pending', 
        };
        return databases.createDocument(DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, ID.unique(), payload);
      });

      const results = await Promise.allSettled(creationPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          createdCount++;
        } else {
          console.error('Failed to create an assignment:', result.reason);
        }
      });

      if (createdCount > 0) {
        setSuccessMessage(`${createdCount} chore(s) assigned successfully!`);
      }
      if (createdCount !== assignmentsData.length) {
        setError(`Some chores could not be assigned. ${assignmentsData.length - createdCount} failed.`);
      }

    } catch (err) {
      console.error('Error assigning chores:', err);
      setError(`An unexpected error occurred during assignment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <header className="text-center py-8 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">Assign Chores</h1>
        <p className="text-lg text-indigo-500 mt-2">Select kids, chores, and a date to create assignments.</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow" role="alert">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-indigo-500 text-xl">Loading kids and chores data...</p>
      ) : (
        kids.length === 0 || chores.length === 0 ? (
          <div className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">
            <p className="text-xl mb-2">Cannot Assign Chores Yet</p>
            {kids.length === 0 && <p>No kids found. Please add kids in the "Manage Kids" section.</p>}
            {chores.length === 0 && <p className="mt-1">No chores found. Please add chores in the "Manage Chores" section.</p>}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <AssignChoreForm
              kids={kids}
              chores={chores}
              onAssignChores={handleAssignChores}
              isLoading={isSubmitting}
            />
          </div>
        )
      )}
      
      { (DATABASE_ID.startsWith('YOUR_') || ASSIGNMENTS_COLLECTION_ID.startsWith('YOUR_') || KIDS_COLLECTION_ID.startsWith('YOUR_') || CHORES_COLLECTION_ID.startsWith('YOUR_')) && (
         <div className="fixed bottom-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-800 border-t border-yellow-400">
            <strong>Reminder:</strong> Please replace placeholder Appwrite IDs in <code>app/assign-chores/page.js</code> with your actual Appwrite project values.
         </div>
       )}
    </div>
  );
}
