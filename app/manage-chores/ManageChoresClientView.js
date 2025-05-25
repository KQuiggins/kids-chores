'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChoresList from '../components/ChoresList';
import ChoreForm from '../components/ChoreForm';
import { deleteChore } from '../actions/fetchChoreAction';

export default function ManageChoresClientView({ initialChores }) {
  const [chores, setChores] = useState(initialChores || []);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [editingChoreData, setEditingChoreData] = useState(null);
  const [pageError, setPageError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setChores(initialChores || []);
  }, [initialChores]);

  const handleAddChoreClick = () => {
    setEditingChoreData(null);
    setShowChoreForm(true);
    setPageError('');
  };

  const handleEditChore = (chore) => {
    setEditingChoreData(chore);
    setShowChoreForm(true);
    setPageError('');
  };

  const handleCancelForm = () => {
    setShowChoreForm(false);
    setEditingChoreData(null);
    setPageError(''); // Also clear page errors when form is cancelled
    router.refresh(); // Re-fetch server data, updating initialChores
  };

  const handleDeleteChore = async (choreId) => {
    if (!confirm('Are you sure you want to delete this chore? This could affect existing assignments.')) {
      return;
    }
    setPageError('');
    const result = await deleteChore(choreId);
    if (result.success) {
      router.refresh(); // Re-fetch server data
    } else {
      // Ensure result.error is a string
      const errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
      setPageError(errorMessage || 'Failed to delete chore.');
    }
  };

  return (
    <>
      {pageError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{pageError}</p>
        </div>
      )}

      {!showChoreForm ? (
        <>
          <div className="text-center mb-8">
            <button
              onClick={handleAddChoreClick}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Add New Chore
            </button>
          </div>
          {chores && chores.length > 0 ? (
            <ChoresList chores={chores} onEditChore={handleEditChore} onDeleteChore={handleDeleteChore} />
          ) : (
            <p className="text-center text-blue-500 text-xl">No chores found. Add one to get started!</p>
          )}
        </>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-semibold text-blue-600 mb-6 text-center">
            {editingChoreData ? 'Edit Chore' : 'Add New Chore'}
          </h2>
          <ChoreForm
            initialData={editingChoreData}
            onCancel={handleCancelForm}
          />
        </div>
      )}
    </>
  );
}
