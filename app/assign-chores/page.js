'use client';

import { useState, useEffect } from 'react';
import AssignChoreForm from '@/app/components/AssignChoreForm';
import { fetchKidsAndChores, createAssignments } from '../actions/assignChoresAction';

export default function AssignChoresPage() {
  const [kids, setKids] = useState([]);
  const [chores, setChores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await fetchKidsAndChores();
      if (result.success) {
        setKids(result.kids);
        setChores(result.chores);
      } else {
        setError(result.error);
        setKids([]);
        setChores([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
      setKids([]);
      setChores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignChores = async (assignmentsData) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await createAssignments(assignmentsData);

      if (result.success) {
        setSuccessMessage(result.message);
        if (result.warning) {
          setError(result.warning);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error assigning chores:', error);
      setError(`An unexpected error occurred during assignment: ${error.message}`);
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
      ) : kids.length === 0 || chores.length === 0 ? (
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
      )}
    </div>
  );
}
