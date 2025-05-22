'use client';

import { useState } from 'react';

export default function KidAssignedChoreCard({ assignment, choreDetails, onToggleComplete, isLoading }) {
  if (!assignment || !choreDetails) {
    return (
      <div className="bg-gray-100 shadow-md rounded-lg p-4 m-2 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    );
  }

  const { title, description } = choreDetails;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    await onToggleComplete(assignment.$id, assignment.status);
    // The parent component will refresh the data, which will cause this component to re-render
    // with the new status. So, local 'isUpdating' can be reset shortly after,
    // or rely on parent's isLoading prop if that covers individual card updates.
    // For now, let's assume parent handles the visual feedback for loading state of the list.
    setIsUpdating(false); 
  };
  
  const cardStyle = assignment.status === 'done' 
    ? 'bg-green-100 border-green-300' 
    : 'bg-yellow-50 border-yellow-300';
  const titleStyle = assignment.status === 'done' 
    ? 'line-through text-green-700' 
    : 'text-yellow-700';
  const buttonStyle = assignment.status === 'done'
    ? 'bg-orange-400 hover:bg-orange-500 text-white'
    : 'bg-green-500 hover:bg-green-600 text-white';

  return (
    <div className={`shadow-lg rounded-lg p-5 m-2 flex flex-col justify-between transition-all duration-300 ease-in-out border-2 ${cardStyle}`}>
      <div>
        <h3 className={`text-xl font-bold mb-2 ${titleStyle}`}>{title}</h3>
        <p className={`text-sm text-gray-600 mb-1 ${assignment.status === 'done' ? 'line-through' : ''}`}>
          {description || 'No description.'}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Assigned for: {new Date(assignment.date).toLocaleDateString()}
        </p>
        <p className={`text-sm font-semibold ${assignment.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>
          Status: {assignment.status === 'done' ? 'Completed!' : 'Pending'}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isUpdating || isLoading} // isLoading is from parent, for broader loading states
        className={`mt-4 w-full font-bold py-2 px-4 rounded-lg transition-colors ${buttonStyle} disabled:bg-gray-300`}
      >
        {isUpdating ? 'Updating...' : (assignment.status === 'done' ? 'Mark as Pending' : 'Mark as Done')}
      </button>
    </div>
  );
}
