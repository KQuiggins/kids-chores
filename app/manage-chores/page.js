// Removed 'use client';
// import { useState, useEffect } from 'react'; // Removed
import { fetchChores } from '@/app/actions/fetchChoreAction';
// import ChoresList from '@/app/components/ChoresList'; // Will be in Client Component
// import ChoreForm from '@/app/components/ChoreForm'; // Will be in Client Component
// import { createChore, updateChore, deleteChore } from '@/app/actions/fetchChoreAction'; // Used by Client Component

import ManageChoresClientView from './ManageChoresClientView';

export default async function ManageChoresPage() {
  const choresData = await fetchChores(); // choresData will be e.g. { success, documents, error }

  if (!choresData.success) {
    // Ensure choresData.error is a string or serializable.
    // The toPlainObject in fetchChores should handle this for error objects.
    const errorMessage = typeof choresData.error === 'string' ? choresData.error : JSON.stringify(choresData.error);
    return (
      <div className="container mx-auto p-4">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold text-blue-700">Manage Chores</h1>
        </header>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  // If successful, it would eventually render the client component:
  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-blue-100 to-green-100 min-h-screen">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-blue-700">Manage Chores</h1>
        <p className="text-lg text-blue-500 mt-2">Add, edit, or remove chores for your household.</p>
      </header>
      <ManageChoresClientView initialChores={choresData.documents} />
    </div>
  );
}
