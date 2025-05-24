'use client';

import { useState, useEffect } from 'react';
import KidsList from '../components/KidsList';
import KidForm from '../components/KidForm';
import { fetchKids, createKid, updateKid, deleteKid } from '../actions/manageKidsAction';

export default function ManageKidsPage() {
  const [kids, setKids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKidForm, setShowKidForm] = useState(false);
  const [editingKidData, setEditingKidData] = useState(null);
  const [error, setError] = useState('');

  async function loadKids() {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchKids();
      if (result.success) {
        setKids(result.kids);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch kids:', error);
      setError('Failed to load kids. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadKids();
  }, []);

  const handleAddKidClick = () => {
    setEditingKidData(null);
    setShowKidForm(true);
    setError('');
  };

  const handleEditKid = (kid) => {
    setEditingKidData(kid);
    setShowKidForm(true);
    setError('');
  };

  const handleCancelForm = () => {
    setShowKidForm(false);
    setEditingKidData(null);
    setError('');
  };

  const handleSubmitKid = async (kidData, kidIdToUpdate) => {
    setIsLoading(true);
    setError('');
    try {
      let result;

      if (kidIdToUpdate) {
        result = await updateKid(kidIdToUpdate, kidData, editingKidData);
      } else {
        result = await createKid(kidData);
      }

      if (result.success) {
        await loadKids();
        setShowKidForm(false);
        setEditingKidData(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to save kid:', error);
      setError(`Failed to save kid: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKid = async (kidId, photoFileIdToDelete) => {
    if (!confirm('Are you sure you want to delete this kid?')) {
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await deleteKid(kidId, photoFileIdToDelete);
      if (result.success) {
        await loadKids();
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to delete kid:', error);
      setError(`Failed to delete kid: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-100 to-pink-100 min-h-screen">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-purple-700">Manage Your Kids</h1>
        <p className="text-lg text-purple-500 mt-2">Add, edit, or remove kid profiles.</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!showKidForm ? (
        <>
          <div className="text-center mb-8">
            <button
              onClick={handleAddKidClick}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Add New Kid
            </button>
          </div>
          {isLoading && !kids.length ? (
            <p className="text-center text-purple-500 text-xl">Loading kids...</p>
          ) : (
            <KidsList kids={kids} onEditKid={handleEditKid} onDeleteKid={handleDeleteKid} />
          )}
        </>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-semibold text-purple-600 mb-6 text-center">
            {editingKidData ? 'Edit Kid' : 'Add New Kid'}
          </h2>
          <KidForm
            onSubmitKid={handleSubmitKid}
            initialData={editingKidData}
            onCancel={handleCancelForm}
          />
        </div>
      )}
    </div>
  );
}
