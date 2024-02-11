import { create } from 'zustand';
import fetchStarred from './components/fetchStarred.js';
import fetchVisitHistory from './components/fetchVisitHistory.js';
import fetchBeingWatched from './components/fetchBeingWatched.js';

const useStore = create((set, get) => ({
  groupMax: 10,

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
      }));
    } catch (error) {
      console.error('Failed to fetch starred:', error);
    }
  },

  beingWatched: [],
  fetchAndSetBeingWatched: async (userId, ip, groupMax) => {
    if (groupMax > 0) {
      try {
        const { data, count } = await fetchBeingWatched(userId, ip, objectLimit);
        set({ beingWatched: data });
        // Log or handle the fetched data as needed
      } catch (error) {
        console.error('Failed to fetch being watched:', error);
      }
    }
  },

  refreshData: async (userId) => {
    const { fetchAndSetStarred, fetchAndSetVisitHistory, groupMax } = get();
    await fetchAndSetStarred(userId, groupMax);
    await fetchAndSetVisitHistory(userId, groupMax);
  },

}));

export default useStore;

