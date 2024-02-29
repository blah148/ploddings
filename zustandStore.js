import { create } from 'zustand';
import fetchStarred from './components/fetchStarred.js';
import fetchVisitHistory from './components/fetchVisitHistory.js';
import fetchBeingWatched from './components/fetchBeingWatched.js';

const useStore = create((set, get) => ({
  maximumObjects: 15,
  objectLimit: 15,
  groupMax: 4,

  starredCount: 0,
  visitHistoryCount: 0,
  visitHistory: [],
  fetchAndSetVisitHistory: async (userId, groupMax, ip) => {
    try {
      const { data, count } = await fetchVisitHistory(userId, groupMax, ip);
      set(state => ({
        visitHistory: data,
        visitHistoryCount: count,
      }));
      // Explicitly call recalculateObjectLimit after setting new data
      get().recalculateObjectLimit();
    } catch (error) {
      console.error('Failed to fetch visit history:', error);
    }
  },
  starred: [],
  fetchAndSetStarred: async (userId, groupMax, ip) => {
    try {
      const { data, count } = await fetchStarred(userId, groupMax, ip);
      set(state => ({
        starred: data,
        starredCount: count,
      }));
      // Explicitly call recalculateObjectLimit after setting new data
      get().recalculateObjectLimit();
    } catch (error) {
      console.error('Failed to fetch starred:', error);
    }
  },
  
  beingWatched: [],
  fetchAndSetBeingWatched: async (userId, ip, objectLimit) => {
    if (objectLimit > 0) {
      try {
        const { data, count } = await fetchBeingWatched(userId, ip, objectLimit);
        set({ beingWatched: data });
      } catch (error) {
        console.error('Failed to fetch being watched:', error);
      }
    }
  },
  
  // Method to recalculate the object limit based on the current counts
  recalculateObjectLimit: () => set(state => {
    const usedSpace = state.starredCount + state.visitHistoryCount;
    const remainingSpace = state.maximumObjects - usedSpace;
    return { objectLimit: Math.max(remainingSpace, 0) };
  }),

  refreshData: async (userId, ip) => {
    await get().refreshVisitHistory(userId, ip);
    await get().refreshStarred(userId, ip);
    // Note: BeingWatched does not affect objectLimit calculation directly
    await get().refreshBeingWatched(userId, ip);
  },

  refreshVisitHistory: async (userId, ip) => {
    await get().fetchAndSetVisitHistory(userId, get().groupMax, ip);
  },

  refreshStarred: async (userId, ip) => {
    await get().fetchAndSetStarred(userId, get().groupMax, ip);
  },

  refreshBeingWatched: async (userId, ip) => {
    await get().fetchAndSetBeingWatched(userId, ip, get().objectLimit);
  },
}));

export default useStore;

