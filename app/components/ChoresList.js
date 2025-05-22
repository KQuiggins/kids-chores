'use client';

import ChoreCard from './ChoreCard';

export default function ChoresList({ chores, onEditChore, onDeleteChore }) {
  if (!chores || chores.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No chores added yet. Add one to get started!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {chores.map((chore) => (
        <ChoreCard
          key={chore.$id}
          chore={chore}
          onEdit={() => onEditChore(chore)}
          onDelete={() => onDeleteChore(chore.$id)}
        />
      ))}
    </div>
  );
}
