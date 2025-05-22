'use client';

import { useState, useEffect } from 'react';
import { databases, ID } from '../lib/appwrite'; // Assuming client is implicitly used by these services
import ChoresList from '../components/ChoresList';
import ChoreForm from '../components/ChoreForm';

// TODO: Replace with your actual Appwrite IDs!
// Find these in your Appwrite project console.
// Database ID: Navigate to Databases, select your database, its ID is in the settings.
// Collection ID: Inside your database, select the 'chores' collection, its ID is in the settings.
// Ensure DATABASE_ID is the same as used in manage-kids page if they share the same database.
const DATABASE_ID = 'YOUR_APPWRITE_DATABASE_ID'; 
const CHORES_COLLECTION_ID = 'YOUR_CHORES_COLLECTION_ID';

export default function ManageChoresPage() {
  const [chores, setChores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [editingChoreData, setEditingChoreData] = useState(null);
  const [error, setError] = useState('');

  async function fetchChores() {
    setIsLoading(true);
    setError('');
    try {
      const response = await databases.listDocuments(DATABASE_ID, CHORES_COLLECTION_ID);
      setChores(response.documents);
    } catch (error) {
      console.error('Failed to fetch chores:', error);
      setError('Failed to load chores. Please ensure Appwrite is configured correctly (Database ID, Chores Collection ID).');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchChores();
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
      const dataPayload = {
        title: choreData.title,
        description: choreData.description,
        frequency: choreData.frequency,
        // created_at is handled by Appwrite ($createdAt)
      };
      
      if (choreIdToUpdate) {
        // Update existing chore
        await databases.updateDocument(DATABASE_ID, CHORES_COLLECTION_ID, choreIdToUpdate, dataPayload);
      } else {
        // Add new chore
        // Appwrite's $createdAt is automatic. If you have a manual 'created_at' field, add it here.
        await databases.createDocument(DATABASE_ID, CHORES_COLLECTION_ID, ID.unique(), dataPayload);
      }

      await fetchChores(); // Refresh list
      setShowChoreForm(false);
      setEditingChoreData(null);
    } catch (error) {
      console.error('Failed to save chore:', error);
      setError(`Failed to save chore: ${error.message}. Check Appwrite configuration.`);
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
      await databases.deleteDocument(DATABASE_ID, CHORES_COLLECTION_ID, choreId);
      await fetchChores(); // Refresh list
    } catch (error) {
      console.error('Failed to delete chore:', error);
      setError(`Failed to delete chore: ${error.message}`);
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
      { (DATABASE_ID.startsWith('YOUR_') || CHORES_COLLECTION_ID.startsWith('YOUR_')) && (
         <div className="fixed bottom-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-800 border-t border-yellow-400">
            <strong>Reminder:</strong> Please replace placeholder Appwrite IDs (<code>DATABASE_ID</code>, <code>CHORES_COLLECTION_ID</code>) in <code>app/manage-chores/page.js</code> with your actual Appwrite project values.
         </div>
       )}
    </div>
  );
}
