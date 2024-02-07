import { create } from 'zustand';

const useGuestStore = create((set, get) => ({
  visitHistory: [],
  starred: [],
  beingWatched: [],

loadGuestData: () => {
  // Helper function to sort by timestamp in descending order
  const sortByTimestampDesc = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);

  const visitHistory = JSON.parse(localStorage.getItem('visitHistory')) || [];
  const starred = JSON.parse(localStorage.getItem('favorites')) || [];
  const beingWatched = JSON.parse(localStorage.getItem('beingWatched')) || [];

  // Sort each array by timestamp in descending order before setting the state
  set({
    visitHistory: visitHistory.sort(sortByTimestampDesc),
    starred: starred.sort(sortByTimestampDesc),
    beingWatched: beingWatched.sort(sortByTimestampDesc),
  });
},
  saveGuestData: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    // Automatically update the store after saving to ensure consistency
    get().loadGuestData();
  },

  // Refresh specific guest data type
  refreshGuestData: () => {
    // This method would re-load all guest data from localStorage
    // Useful if you have a specific action that updates localStorage directly
    get().loadGuestData();
  },

  // Example function to update a specific type of data and refresh
  updateStarred: (newStarredItem) => {
    const currentStarred = JSON.parse(localStorage.getItem('favorites')) || [];
    const updatedStarred = [...currentStarred, newStarredItem];
    get().saveGuestData('favorites', updatedStarred);
    // No need to call loadGuestData explicitly as saveGuestData already does this
  },

  // Initial loading of guest data
  initialize: () => {
    get().loadGuestData();
  }
}));

export default useGuestStore;

