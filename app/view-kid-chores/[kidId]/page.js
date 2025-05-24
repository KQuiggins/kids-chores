'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { fetchKidDetails, fetchKidAssignments, updateAssignmentStatus } from '@/app/actions/fetchKidChoresAction';
import KidAssignedChoreCard from '@/app/components/KidAssignedChoreCard';
import Image from 'next/image';

export default function ViewKidChoresPage() {
  const pathname = usePathname();
  const kidId = pathname ? pathname.split('/').pop() : null;

  const [kidDetails, setKidDetails] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [choresDetails, setChoresDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [progressPercent, setProgressPercent] = useState(0);

  const fetchKidData = useCallback(async () => {
    if (!kidId) {
      setError('Kid ID not found in URL.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {

      const kidResult = await fetchKidDetails(kidId);
      if (!kidResult.success) {
        setError(kidResult.error);
        return;
      }
      setKidDetails(kidResult.kid);


      const assignmentsResult = await fetchKidAssignments(kidId, filterDate);
      if (!assignmentsResult.success) {
        setError(assignmentsResult.error);
        return;
      }

      setAssignments(assignmentsResult.assignments);
      setChoresDetails(assignmentsResult.choresDetails);
      setProgressPercent(assignmentsResult.progressPercent);

    } catch (err) {
      console.error('Failed to fetch kid data:', err);
      setError(`Failed to load data: ${err.message}`);
      setKidDetails(null);
      setAssignments([]);
      setChoresDetails({});
    } finally {
      setIsLoading(false);
    }
  }, [kidId, filterDate]);

  useEffect(() => {
    fetchKidData();
  }, [fetchKidData]);

  const handleToggleComplete = async (assignmentId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';


    setAssignments(prevAssignments =>
      prevAssignments.map(a => a.$id === assignmentId ? { ...a, status: newStatus } : a)
    );


    const updatedAssignments = assignments.map(a => a.$id === assignmentId ? { ...a, status: newStatus } : a);
    const doneCount = updatedAssignments.filter(a => a.status === 'done').length;
    const newProgress = updatedAssignments.length > 0 ? (doneCount / updatedAssignments.length) * 100 : 0;
    setProgressPercent(newProgress);

    try {
      const result = await updateAssignmentStatus(assignmentId, newStatus);
      if (!result.success) {
        setError(result.error);

        setAssignments(prevAssignments =>
          prevAssignments.map(a => a.$id === assignmentId ? { ...a, status: currentStatus } : a)
        );

        const revertedDoneCount = assignments.filter(a => a.status === 'done').length;
        const revertedProgress = assignments.length > 0 ? (revertedDoneCount / assignments.length) * 100 : 0;
        setProgressPercent(revertedProgress);
      }
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      setError('Failed to update chore status. Please try again.');

      setAssignments(prevAssignments =>
        prevAssignments.map(a => a.$id === assignmentId ? { ...a, status: currentStatus } : a)
      );

      const revertedDoneCount = assignments.filter(a => a.status === 'done').length;
      const revertedProgress = assignments.length > 0 ? (revertedDoneCount / assignments.length) * 100 : 0;
      setProgressPercent(revertedProgress);
    }
  };

  const getChoreDetail = (choreId) => {
    return choresDetails[choreId] || { title: 'Loading chore...', description: '' };
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-yellow-50 to-orange-100 min-h-screen">
      {isLoading && !kidDetails && <p className="text-center text-orange-500 text-xl">Loading kid's chores...</p>}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {kidDetails && (
        <header className="text-center py-8 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 relative mx-auto mb-4 rounded-full overflow-hidden border-4 border-orange-300">
            {kidDetails.photoUrl ? (
              <Image
                src={kidDetails.photoUrl}
                alt={kidDetails.name || 'Kid avatar'}
                width={128}
                height={128}
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200"></div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-orange-600">Chores for {kidDetails.name}</h1>
          <div className="mt-4">
            <label htmlFor="filterDate" className="mr-2 text-orange-700">Filter by Date:</label>
            <input
              type="date"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="w-full max-w-md mx-auto my-4">
            <p className="text-sm text-orange-700 mb-1 text-center">
              Progress for {new Date(filterDate).toLocaleDateString()}: {progressPercent.toFixed(0)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3.5 dark:bg-gray-700">
              <div
                className="bg-green-500 h-3.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              ></div>
            </div>
          </div>
        </header>
      )}

      {!isLoading && !error && assignments.length === 0 && kidDetails && (
        <p className="text-center text-gray-500 text-lg">
          No chores assigned for {kidDetails.name} on {new Date(filterDate).toLocaleDateString()}.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {assignments.map((assignment) => (
          <KidAssignedChoreCard
            key={assignment.$id}
            assignment={assignment}
            choreDetails={getChoreDetail(assignment.chore_id)}
            onToggleComplete={handleToggleComplete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
