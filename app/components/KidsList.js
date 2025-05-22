'use client';

import KidCard from './KidCard';

export default function KidsList({ kids, onEditKid, onDeleteKid }) {
  if (!kids || kids.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No kids added yet. Add one to get started!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {kids.map((kid) => (
        <KidCard
          key={kid.$id}
          kid={kid}
          onEdit={() => onEditKid(kid)}
          onDelete={() => onDeleteKid(kid.$id, !kid.default_avatar_used && kid.photo_url ? kid.photo_url : null)}
        />
      ))}
    </div>
  );
}
