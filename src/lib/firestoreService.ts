import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, 
  onSnapshot, query, where 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { BusinessLead, CrmTask, AutomationSequence } from '../types';

// Sync Leads for current user
export function subscribeLeads(userId: string, callback: (leads: BusinessLead[]) => void) {
  const path = 'leads';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items: BusinessLead[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as BusinessLead);
      });
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Save or update lead in Firestore
export async function saveLeadToFirestore(lead: BusinessLead, userId: string) {
  const path = `leads/${lead.id}`;
  try {
    const leadData = { ...lead, userId };
    await setDoc(doc(db, 'leads', lead.id), leadData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete lead from Firestore
export async function deleteLeadFromFirestore(leadId: string) {
  const path = `leads/${leadId}`;
  try {
    await deleteDoc(doc(db, 'leads', leadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sync Tasks for current user
export function subscribeTasks(userId: string, callback: (tasks: CrmTask[]) => void) {
  const path = 'tasks';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items: CrmTask[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as CrmTask);
      });
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Save or update task in Firestore
export async function saveTaskToFirestore(task: CrmTask, userId: string) {
  const path = `tasks/${task.id}`;
  try {
    const taskData = { ...task, userId };
    await setDoc(doc(db, 'tasks', task.id), taskData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync Sequences for current user
export function subscribeSequences(userId: string, callback: (sequences: AutomationSequence[]) => void) {
  const path = 'sequences';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items: AutomationSequence[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AutomationSequence);
      });
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Save or update sequence in Firestore
export async function saveSequenceToFirestore(seq: AutomationSequence, userId: string) {
  const path = `sequences/${seq.id}`;
  try {
    const seqData = { ...seq, userId };
    await setDoc(doc(db, 'sequences', seq.id), seqData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
