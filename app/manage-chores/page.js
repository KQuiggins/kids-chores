'use client';

import { useState, useEffect } from 'react';
import { fetchChores, createChore, updateChore, deleteChore } from '@/app/actions/fetchChoreAction';
import ChoresList from '@/app/components/ChoresList';
import ChoreForm from '@/app/components/ChoreForm';

export default function ManageChoresPage() {
  const [chores, setChores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [editingChoreData, setEditingChoreData] = useState(null);
  const [error, setError] = useState('');

  async function loadChores() {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchChores();
      logging('Chores fetched:', result);
      if (result.success) {
        setChores(result.documents);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch chores:', error);
      setError('Failed to load chores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadChores();
  }, []);

  const handleAddChoreClick = () => {
    setEditingChoreData(null);
    setShowChoreForm(true);
    setError('');
  };

  const handleEditChore = (chore) => {
    setEditingChoreData(chore);
    setShowChoreForm(true);
    setError('');
  };

  const handleCancelForm = () => {
    setShowChoreForm(false);
    setEditingChoreData(null);
    setError('');
  };

  const handleSubmitChore = async (choreData, choreIdToUpdate) => {
    setIsLoading(true);
    setError('');
    try {
      let result;
      if (choreIdToUpdate) {
        result = await updateChore(choreIdToUpdate, choreData);
      } else {
        result = await createChore(choreData);
      }

      if (result.success) {
        await loadChores();
        setShowChoreForm(false);
        setEditingChoreData(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to save chore:', error);
      setError('Failed to save chore. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChore = async (choreId) => {
    if (!confirm('Are you sure you want to delete this chore? This could affect existing assignments.')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await deleteChore(choreId);
      if (result.success) {
        await loadChores(); // Refresh list
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to delete chore:', error);
      setError('Failed to delete chore. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-blue-100 to-green-100 min-h-screen">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-blue-700">Manage Chores</h1>
        <p className="text-lg text-blue-500 mt-2">Add, edit, or remove chores for your household.</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
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
          {isLoading && !chores.length ? (
            <p className="text-center text-blue-500 text-xl">Loading chores...</p>
          ) : (
            <ChoresList chores={chores} onEditChore={handleEditChore} onDeleteChore={handleDeleteChore} />
          )}
        </>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-semibold text-blue-600 mb-6 text-center">
            {editingChoreData ? 'Edit Chore' : 'Add New Chore'}
          </h2>
          <ChoreForm
            onSubmitChore={handleSubmitChore}
            initialData={editingChoreData}
            onCancel={handleCancelForm}
          />
        </div>
      )}
    </div>
  );
}
