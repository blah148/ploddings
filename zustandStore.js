import create from 'zustand';
import fetchStarred from './components/fetchStarred.js';
import fetchVisitHistory from './components/fetchVisitHistory.js';
import fetchBeingWatched from './components/fetchBeingWatched.js';

const useStore = create(set => ({
  maximumObjects: 8,
  objectLimit: 8,
  groupMax: 3,

  starredCount: 0,
  visitHistoryCount: 0,
  visitHistory: [],
  fetchAndSetVisitHistory: async (userId, groupMax) => {
    try {
      const { data, count } = await fetchVisitHistory(userId, groupMax);
      set(state => ({
        visitHistory: data,
        visitHistoryCount: count,
        // Optionally recalculate objectLimit here if it depends on visitHistoryCount
        objectLimit: state.maximumObjects - (state.starredCount + count)
      }));
    } catch (error) {
      console.error('Failed to fetch visit history:', error);
    }
  },
  starred: [],
  fetchAndSetStarred: async (userId, groupMax) => {
    try {
      const { data, count } = await fetchStarred(userId, groupMax);
      set(state => ({
        starred: data,
        starredCount: count,
        // Optionally recalculate objectLimit here if it depends on starredCount
        objectLimit: state.maximumObjects - (count + state.visitHistoryCount)
      }));
    } catch (error) {
      console.error('Failed to fetch starred:', error);
    }
  },

  recalculateObjectLimit: () => set((state) => {
    const usedSpace = state.starredCount + state.visitHistoryCount;
    const remainingSpace = state.maximumObjects - usedSpace;
    return { objectLimit: Math.max(remainingSpace, 0) };
  }),

  beingWatched: [],
  setBeingWatched: (data) => set(() => ({ beingWatched: data })),

  fetchAndSetBeingWatched: async (userId, ip, objectLimit) => {
    if (objectLimit > 0 && userId && ip) {
      try {
        const { data, count } = await fetchBeingWatched(userId, ip, objectLimit);
        set({ beingWatched: data });
        // Log or handle the fetched data as needed
      } catch (error) {
        console.error('Failed to fetch being watched:', error);
      }
    }
  },

}));

export default useStore;

