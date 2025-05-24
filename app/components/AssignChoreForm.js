'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createAssignments } from '@/app/actions/assignChoresAction';

const initialState = { message: null, error: null, success: false, warning: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
    >
      {pending ? 'Assigning...' : 'Assign Chores'}
    </button>
  );
}

export default function AssignChoreForm({ kids, chores, onCancel }) { // Removed onAssignChores, isLoading. Added onCancel for potential use.
  const [selectedKidIds, setSelectedKidIds] = useState([]);
  const [selectedChoreIds, setSelectedChoreIds] = useState([]);
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);

  const [state, formAction] = useFormState(createAssignments, initialState);

  useEffect(() => {
    if (state.success) {
      setSelectedKidIds([]);
      setSelectedChoreIds([]);
      // Optionally reset date or close form via onCancel
      // setAssignmentDate(new Date().toISOString().split('T')[0]); 
      if(onCancel) onCancel(); // Example: closing a modal after successful assignment
    }
  }, [state.success, onCancel]);


  const handleKidSelection = (kidId) => {
    setSelectedKidIds((prev) =>
      prev.includes(kidId) ? prev.filter((id) => id !== kidId) : [...prev, kidId]
    );
  };

  const handleChoreSelection = (choreId) => {
    setSelectedChoreIds((prev) =>
      prev.includes(choreId) ? prev.filter((id) => id !== choreId) : [...prev, choreId]
    );
  };

  const toggleSelectAllKids = () => {
    if (selectedKidIds.length === kids.length) {
      setSelectedKidIds([]);
    } else {
      setSelectedKidIds(kids.map(k => k.$id));
    }
  };

  const toggleSelectAllChores = () => {
    if (selectedChoreIds.length === chores.length) {
      setSelectedChoreIds([]);
    } else {
      setSelectedChoreIds(chores.map(c => c.$id));
    }
  };

  return (
    <form action={formAction} className="space-y-8 p-6 bg-white shadow-xl rounded-lg">
      {/* Display messages */}
      {state.message && !state.error && !state.warning && <p className="text-sm text-green-600 p-2 bg-green-50 rounded-md">{state.message}</p>}
      {state.warning && <p className="text-sm text-yellow-700 p-2 bg-yellow-50 rounded-md">{state.warning} {state.message}</p>}
      {state.error && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{state.error}</p>}
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Kids</h3>
        <button type="button" onClick={toggleSelectAllKids} className="mb-2 text-sm text-indigo-600 hover:text-indigo-800">
          {selectedKidIds.length === kids.length ? 'Deselect All Kids' : 'Select All Kids'}
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2 border rounded">
          {kids.map((kid) => (
            <label
              key={kid.$id}
              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                selectedKidIds.includes(kid.$id) ? 'bg-indigo-100 border-indigo-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
              } border`}
            >
              <input
                type="checkbox"
                name="kidIds" // Added name attribute
                value={kid.$id} // Added value attribute
                checked={selectedKidIds.includes(kid.$id)}
                onChange={() => handleKidSelection(kid.$id)}
                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{kid.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Chores</h3>
        <button type="button" onClick={toggleSelectAllChores} className="mb-2 text-sm text-indigo-600 hover:text-indigo-800">
          {selectedChoreIds.length === chores.length ? 'Deselect All Chores' : 'Select All Chores'}
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border rounded">
          {chores.map((chore) => (
            <label
              key={chore.$id}
              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                selectedChoreIds.includes(chore.$id) ? 'bg-green-100 border-green-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
              } border`}
            >
              <input
                type="checkbox"
                name="choreIds" // Added name attribute
                value={chore.$id} // Added value attribute
                checked={selectedChoreIds.includes(chore.$id)}
                onChange={() => handleChoreSelection(chore.$id)}
                className="form-checkbox h-5 w-5 text-gray-900 rounded focus:ring-green-500" // text-green-600 might be better
              />
              <div>
                <span className="text-sm text-gray-700">{chore.title}</span>
                <p className="text-xs text-gray-900">{chore.frequency}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="assignmentDate" className="block text-lg font-medium text-gray-900 mb-2">
          Assignment Date
        </label>
        <input
          type="date"
          id="assignmentDate"
          name="assignmentDate" // Added name attribute
          value={assignmentDate}
          onChange={(e) => setAssignmentDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
          required
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
