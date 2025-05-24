'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchKidsWithProgress } from './actions/fetchKidsAction';
import KidCard from './components/KidCard';
import Image from 'next/image';

export default function HomePage() {
  const [kids, setKids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadKids();
  }, []);

  const loadKids = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await fetchKidsWithProgress();
      if (result.success) {
        setKids(result.kids);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load kids:', error);
      setError('Failed to load kids. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-100 to-pink-100 min-h-screen">
      <header className="text-center py-8">
        <div className="flex justify-center items-center mb-4">
          <Image src="/logo.png" alt="Kids Chores App" width={80} height={80} className="mr-4" />
          <h1 className="text-6xl font-bold text-purple-600">Kids Chores Tracker</h1>
        </div>
        <p className="text-xl text-purple-500">Making chores fun and manageable for the whole family!</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <nav className="flex justify-center space-x-4 mb-8">
        <Link href="/manage-kids" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          Manage Kids
        </Link>
        <Link href="/manage-chores" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          Manage Chores
        </Link>
        <Link href="/assign-chores" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          Assign Chores
        </Link>
      </nav>

      <section>
        <h2 className="text-4xl font-semibold text-center text-purple-600 mb-8">Your Kids</h2>
        {isLoading ? (
          <p className="text-center text-purple-500 text-xl">Loading kids...</p>
        ) : kids.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">No kids added yet!</p>
            <Link href="/manage-kids" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
              Add Your First Kid
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {kids.map((kid) => (
              <KidCard
                key={kid.$id}
                kid={kid}
                showViewChoresLink={true}
                progressPercent={kid.progressPercent}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
