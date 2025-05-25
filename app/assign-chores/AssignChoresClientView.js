'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Not strictly needed if form handles its own refresh or messages
import AssignChoreForm from '../components/AssignChoreForm';

export default function AssignChoresClientView({ initialKids, initialChores }) {
  const [kids, setKids] = useState(initialKids || []);
  const [chores, setChores] = useState(initialChores || []);
  // const router = useRouter(); // Available if needed for explicit page refresh

  useEffect(() => {
    setKids(initialKids || []);
  }, [initialKids]);

  useEffect(() => {
    setChores(initialChores || []);
  }, [initialChores]);

  // AssignChoreForm handles its own submission state and messages via useFormState.
  // If a successful assignment should trigger a page refresh,
  // the AssignChoreForm's useEffect on state.success can call onCancel,
  // and this component can then trigger router.refresh() if onCancel is passed here.
  // For now, assuming AssignChoreForm's internal handling is sufficient.
  // The onCancel prop in AssignChoreForm is used to reset its internal state.

  return (
    <div className="max-w-2xl mx-auto">
      <AssignChoreForm
        kids={kids}
        chores={chores}
        // The onCancel prop in AssignChoreForm is for resetting the form's internal state.
        // If this client view needed to do something specific after assignment (like a full page refresh),
        // AssignChoreForm could take another callback prop, e.g., onAssignmentComplete.
        // For this iteration, AssignChoreForm handles displaying its own messages.
      />
    </div>
  );
}
