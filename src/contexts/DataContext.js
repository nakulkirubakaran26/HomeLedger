import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

const DataContext = createContext({});

// ======================
// INDIAN WEEK HELPER
// ======================
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d - yearStart) / 86400000) + 1;
  return Math.ceil((dayOfYear + yearStart.getDay()) / 7);
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [bills, setBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [userPreferences, setUserPreferences] = useState({ 
    weeklyDigest: false, 
    emailAlerts: true, 
    budgetWarnings: true,
    currency: 'INR'
  });
  const [savedBudget, setSavedBudget] = useState(null);
  const [budgetDocId, setBudgetDocId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const getTargetWeekYear = useCallback(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return {
      week: getWeekNumber(base),
      year: base.getFullYear()
    };
  }, [weekOffset]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { week, year } = getTargetWeekYear();

      // Fetch Weekly Bills
      const billsQuery = query(
        collection(db, 'bills'),
        where('userId', '==', user.uid),
        where('week', '==', week),
        where('year', '==', year)
      );
      const billsSnapshot = await getDocs(billsQuery);
      const weeklyBills = billsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
      setBills(weeklyBills);

      // Fetch All Bills
      const allBillsQuery = query(
        collection(db, 'bills'),
        where('userId', '==', user.uid)
      );
      const allBillsSnapshot = await getDocs(allBillsQuery);
      setAllBills(allBillsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })));

      // Fetch Budget
      const budgetQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', user.uid),
        where('week', '==', week),
        where('year', '==', year)
      );
      const budgetSnapshot = await getDocs(budgetQuery);
      if (!budgetSnapshot.empty) {
        setSavedBudget(budgetSnapshot.docs[0].data().amount);
        setBudgetDocId(budgetSnapshot.docs[0].id);
      } else {
        setSavedBudget(null);
        setBudgetDocId(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getTargetWeekYear]);

  // Fetch User Preferences separately
  const fetchUserPreferences = useCallback(async () => {
      if (!user) return;
      try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('userId', '==', user.uid)));
          if (!userDoc.empty) {
             const prefs = userDoc.docs[0].data().preferences || {};
             setUserPreferences({ 
                 weeklyDigest: false, 
                 emailAlerts: true, 
                 budgetWarnings: true,
                 currency: 'INR',
                 ...prefs 
             });
          }
      } catch (error) {
          console.error("Error fetching preferences:", error);
      }
  }, [user]);

  useEffect(() => {
    fetchData();
    fetchUserPreferences();
  }, [fetchData, fetchUserPreferences]);

  const addBill = async (billData) => {
    const week = getWeekNumber(billData.billDate);
    const year = new Date(billData.billDate).getFullYear();

    await addDoc(collection(db, 'bills'), {
      userId: user.uid,
      ...billData,
      week,
      year,
      createdAt: serverTimestamp()
    });
    fetchData();
  };

  const deleteBill = async (id) => {
    await deleteDoc(doc(db, 'bills', id));
    fetchData();
  };

  const updateBill = async (id, updatedData) => {
      const week = getWeekNumber(updatedData.billDate);
      const year = new Date(updatedData.billDate).getFullYear();
      await updateDoc(doc(db, 'bills', id), {
          ...updatedData,
          week,
          year,
          updatedAt: serverTimestamp()
      });
      fetchData();
  }

  const saveBudget = async (amount) => {
    const { week, year } = getTargetWeekYear();
    if (budgetDocId) {
      await updateDoc(doc(db, 'budgets', budgetDocId), {
        amount: Number(amount),
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'budgets'), {
        userId: user.uid,
        amount: Number(amount),
        week,
        year,
        createdAt: serverTimestamp()
      });
    }
    fetchData();
  };

  const savePreferences = async (prefs) => {
      try {
          const userQuery = query(collection(db, 'users'), where('userId', '==', user.uid));
          const snapshot = await getDocs(userQuery);
          
          if (!snapshot.empty) {
              await updateDoc(doc(db, 'users', snapshot.docs[0].id), {
                  preferences: prefs,
                  updatedAt: serverTimestamp()
              });
          } else {
              await addDoc(collection(db, 'users'), {
                  userId: user.uid,
                  email: user.email,
                  preferences: prefs,
                  createdAt: serverTimestamp()
              });
          }
          setUserPreferences(prefs);
      } catch (error) {
          console.error("Error saving preferences:", error);
      }
  }

  const formatCurrency = useCallback((amount) => {
      const currency = userPreferences.currency || 'INR';
      return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currency,
          maximumFractionDigits: 0
      }).format(amount);
  }, [userPreferences.currency]);

  return (
    <DataContext.Provider value={{
      bills,
      allBills,
      savedBudget,
      weekOffset,
      userPreferences,
      setWeekOffset,
      addBill,
      deleteBill,
      updateBill,
      saveBudget,
      savePreferences,
      formatCurrency,
      getTargetWeekYear,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
