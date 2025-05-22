'use client';

export default function ChoreCard({ chore, onEdit, onDelete }) {
  if (!chore) {
    return null;
  }

  const frequencyText = {
    daily: 'Daily',
    weekly: 'Weekly',
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-2 flex flex-col justify-between transform transition-all hover:scale-105">
      <div>
        <h3 className="text-2xl font-bold text-blue-600 mb-2">{chore.title}</h3>
        <p className="text-gray-700 mb-1 h-20 overflow-y-auto">{chore.description || 'No description provided.'}</p>
        <p className="text-sm text-blue-500 font-semibold mb-4">
          Frequency: {frequencyText[chore.frequency] || chore.frequency}
        </p>
      </div>
      <div className="flex space-x-3 mt-4">
        <button
          onClick={() => onEdit(chore)}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(chore.$id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
