'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createChore, updateChore } from '@/app/actions/fetchChoreAction';

const initialState = { message: null, error: null, success: false };

function SubmitButton({ initialData }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
    >
      {pending ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Chore')}
    </button>
  );
}

export default function ChoreForm({ initialData, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');

  const serverAction = initialData ? updateChore.bind(null, initialData.$id) : createChore;
  const [state, formAction] = useFormState(serverAction, initialState);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setFrequency(initialData.frequency || 'daily');
    } else {
      setTitle('');
      setDescription('');
      setFrequency('daily');
    }
  }, [initialData]);

  useEffect(() => {
    if (state.success && onCancel) {
      onCancel();
    }
  }, [state.success, onCancel]);

  return (
    <form action={formAction} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Chore Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
        ></textarea>
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <select
          id="frequency"
          name="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          {/* Add other frequencies if needed, e.g., "monthly" */}
        </select>
      </div>

      {state.message && !state.error && <p className={`text-sm ${state.success ? 'text-green-600' : 'text-yellow-600'}`}>{state.message}</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <SubmitButton initialData={initialData} />
      </div>
    </form>
  );
}
