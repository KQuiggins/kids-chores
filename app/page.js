'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { databases, Query } from './lib/appwrite'; // Assuming client, storage are implicitly used or not needed directly here
import KidCard from './components/KidCard'; // Assuming KidCard is in components
import Image from 'next/image'; // For logo or other images if needed

// TODO: Replace with your actual Appwrite IDs from your Appwrite project console!
// These should match the ones used in other pages like manage-kids, etc.
const DATABASE_ID = 'YOUR_APPWRITE_DATABASE_ID'; 
const KIDS_COLLECTION_ID = 'YOUR_KIDS_COLLECTION_ID';
// PROFILE_PHOTOS_BUCKET_ID is used by KidCard, so it must be correctly configured in KidCard or passed if KidCard expects it
// For this page, we primarily need DATABASE_ID and KIDS_COLLECTION_ID for fetching kids.
const ASSIGNMENTS_COLLECTION_ID = 'YOUR_ASSIGNMENTS_COLLECTION_ID'; // Add this for fetching assignments

export default function HomePage() {
  const [kidsWithProgress, setKidsWithProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError('');
      try {
        const today = new Date();
        const todayStartISO = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const todayEndISO = new Date(today.setHours(23, 59, 59, 999)).toISOString();

        // Fetch kids
        const kidsResponse = await databases.listDocuments(DATABASE_ID, KIDS_COLLECTION_ID, [Query.limit(12)]);
        const fetchedKids = kidsResponse.documents;

        // Fetch today's assignments for all kids
        const assignmentsResponse = await databases.listDocuments(DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, [
          Query.greaterThanEqual('date', todayStartISO),
          Query.lessThanEqual('date', todayEndISO),
          Query.limit(500) // Adjust limit as necessary, assuming up to 500 assignments today across all kids.
        ]);
        const todaysAssignments = assignmentsResponse.documents;

        // Calculate progress for each kid
        const kidsDataWithProgress = fetchedKids.map(kid => {
          const kidAssignmentsToday = todaysAssignments.filter(a => a.kid_id === kid.$id);
          const doneCount = kidAssignmentsToday.filter(a => a.status === 'done').length;
          const totalAssignmentsForKidToday = kidAssignmentsToday.length;
          const progressPercent = totalAssignmentsForKidToday > 0 ? (doneCount / totalAssignmentsForKidToday) * 100 : 0;
          
          return { ...kid, progressPercent };
        });

        setKidsWithProgress(kidsDataWithProgress);

      } catch (error) {
        console.error('Failed to fetch data for dashboard:', error);
        setError('Failed to load dashboard data. Make sure Appwrite is configured with correct IDs (Kids, Assignments Collections).');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl shadow-xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">Welcome to Chore Champions!</h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto">
          Your friendly helper for managing household chores and tracking your little champions' progress.
        </p>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-semibold text-gray-800">Meet the Champions</h2>
          <Link href="/manage-kids" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:shadow-md transition-all">
            Manage All Kids
          </Link>
        </div>
        {isLoading && <p className="text-center text-gray-600 py-5">Loading your champions and their progress...</p>}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md shadow" role="alert">
            <p className="font-bold">Error loading dashboard:</p>
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && kidsWithProgress.length === 0 && (
          <p className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
            No kids found. Add some champions in the "Manage Kids" section to see their progress here!
          </p>
        )}
        {!isLoading && !error && kidsWithProgress.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {kidsWithProgress.map((kid) => (
              <KidCard 
                key={kid.$id} 
                kid={kid} 
                showViewChoresLink={true} 
                progressPercent={kid.progressPercent} 
                // For dashboard, onEdit/onDelete are not primary actions, so we pass empty stubs or handle appropriately
                onEdit={() => console.log('Edit action from dashboard - not implemented')} 
                onDelete={() => console.log('Delete action from dashboard - not implemented')} 
              />
            ))}
          </div>
        )}
      </section>

      <section className="py-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/manage-chores" className="block p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg text-center transition-transform transform hover:scale-105">
            <h3 className="text-2xl font-bold mb-2">Manage Chores</h3>
            <p>Add new chores or edit existing ones.</p>
          </Link>
          <Link href="/assign-chores" className="block p-6 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg text-center transition-transform transform hover:scale-105">
            <h3 className="text-2xl font-bold mb-2">Assign Chores</h3>
            <p>Assign chores to your little champions.</p>
          </Link>
          <Link href="/manage-kids" className="block p-6 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-lg text-center transition-transform transform hover:scale-105 md:col-start-2 md:col-span-1">
             {/* Centering the third button on medium screens if only 3 items. Adjust if more. */}
            <h3 className="text-2xl font-bold mb-2">Manage Kids</h3>
            <p>Add or edit kid profiles.</p>
          </Link>
        </div>
      </section>
      
      { (DATABASE_ID.startsWith('YOUR_') || KIDS_COLLECTION_ID.startsWith('YOUR_') || ASSIGNMENTS_COLLECTION_ID.startsWith('YOUR_')) && (
         <div className="fixed bottom-0 left-0 right-0 bg-yellow-300 p-3 text-center text-yellow-900 border-t-2 border-yellow-500 shadow-lg">
            <strong>Reminder:</strong> Please replace placeholder Appwrite IDs (<code>DATABASE_ID</code>, <code>KIDS_COLLECTION_ID</code>, <code>ASSIGNMENTS_COLLECTION_ID</code>) in <code>app/page.js</code> with your actual Appwrite project values to see progress.
         </div>
       )}
    </div>
  );
}
