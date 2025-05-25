'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KidsList from '../components/KidsList';
import KidForm from '../components/KidForm';
import { deleteKid } from '../actions/manageKidsAction';

export default function ManageKidsClientView({ initialKids }) {
  const [kids, setKids] = useState(initialKids || []);
  const [showKidForm, setShowKidForm] = useState(false);
  const [editingKidData, setEditingKidData] = useState(null);
  const [pageError, setPageError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setKids(initialKids || []);
  }, [initialKids]);

  const handleAddKidClick = () => {
    setEditingKidData(null);
    setShowKidForm(true);
    setPageError('');
  };

  const handleEditKid = (kid) => {
    setEditingKidData(kid);
    setShowKidForm(true);
    setPageError('');
  };

  const handleCancelForm = () => {
    setShowKidForm(false);
    setEditingKidData(null);
    setPageError(''); 
    router.refresh(); 
  };

  const handleDeleteKid = async (kidId, photoFileIdToDelete) => {
    if (!confirm('Are you sure you want to delete this kid?')) {
      return;
    }
    setPageError('');
    const result = await deleteKid(kidId, photoFileIdToDelete);
    if (result.success) {
      router.refresh(); 
    } else {
      // Ensure result.error is a string, as it might be an object from toPlainObject in case of serializationError
      const errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
      setPageError(errorMessage || 'Failed to delete kid.');
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
          {kids && kids.length > 0 ? (
            <KidsList kids={kids} onEditKid={handleEditKid} onDeleteKid={handleDeleteKid} />
          ) : (
            <p className="text-center text-purple-500 text-xl">No kids found. Add one to get started!</p>
          )}
        </>
      ) : (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-semibold text-purple-600 mb-6 text-center">
            {editingKidData ? 'Edit Kid' : 'Add New Kid'}
          </h2>
          <KidForm
            initialData={editingKidData}
            onCancel={handleCancelForm}
          />
        </div>
      )}
    </>
  );
}
