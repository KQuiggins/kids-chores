// Removed 'use client';
// import { useState, useEffect } from 'react'; // Removed
// import AssignChoreForm from '@/app/components/AssignChoreForm'; // Will be in Client Component
import { fetchKidsAndChores } from '../actions/assignChoresAction';
// import { createAssignments } from '../actions/assignChoresAction'; // Used by Client Component

import AssignChoresClientView from './AssignChoresClientView';

export default async function AssignChoresPage() {
  const initialData = await fetchKidsAndChores(); // e.g. { success, kids, chores, error }

  if (!initialData.success) {
    // Ensure initialData.error is a string or serializable.
    // The toPlainObject in fetchKidsAndChores should handle this for error objects.
    const errorMessage = typeof initialData.error === 'string' ? initialData.error : JSON.stringify(initialData.error);
    return (
      <div className="container mx-auto p-4">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">Assign Chores</h1>
        </header>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error fetching initial data</p>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  // If successful, check if kids or chores are empty
  if (initialData.success && (!initialData.kids || initialData.kids.length === 0 || !initialData.chores || initialData.chores.length === 0)) {
    return (
      <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
        <header className="text-center py-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">Assign Chores</h1>
          <p className="text-lg text-indigo-500 mt-2">Select kids, chores, and a date to create assignments.</p>
        </header>
        <div className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
          <p className="text-xl mb-2 font-semibold text-indigo-700">Cannot Assign Chores Yet</p>
          {(!initialData.kids || initialData.kids.length === 0) && 
            <p className="text-gray-700">No kids found. Please add kids in the "Manage Kids" section before assigning chores.</p>
          }
          {(!initialData.chores || initialData.chores.length === 0) && 
            <p className="mt-1 text-gray-700">No chores found. Please add chores in the "Manage Chores" section before assigning them.</p>
          }
        </div>
      </div>
    );
  }

  // If data is present and successful, render the client component
  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <header className="text-center py-8 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">Assign Chores</h1>
        <p className="text-lg text-indigo-500 mt-2">Select kids, chores, and a date to create assignments.</p>
      </header>
      <AssignChoresClientView initialKids={initialData.kids} initialChores={initialData.chores} />
    </div>
  );
}
