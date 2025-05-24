'use client';

import { useState } from 'react';

export default function AssignChoreForm({ kids, chores, onAssignChores, isLoading }) {
  const [selectedKidIds, setSelectedKidIds] = useState([]);
  const [selectedChoreIds, setSelectedChoreIds] = useState([]);
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedKidIds.length === 0) {
      alert('Please select at least one kid.');
      return;
    }
    if (selectedChoreIds.length === 0) {
      alert('Please select at least one chore.');
      return;
    }
    if (!assignmentDate) {
      alert('Please select a date for the assignment.');
      return;
    }

    const assignments = [];
    selectedKidIds.forEach((kidId) => {
      selectedChoreIds.forEach((choreId) => {
        assignments.push({
          kid_id: kidId,
          chore_id: choreId,
          date: new Date(assignmentDate).toISOString(),
          status: 'pending',
        });
      });
    });
    onAssignChores(assignments);
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
    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white shadow-xl rounded-lg">
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
                checked={selectedChoreIds.includes(chore.$id)}
                onChange={() => handleChoreSelection(chore.$id)}
                className="form-checkbox h-5 w-5 text-gray-900 rounded focus:ring-green-500"
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
          value={assignmentDate}
          onChange={(e) => setAssignmentDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Assigning...' : 'Assign Chores'}
        </button>
      </div>
    </form>
  );
}
