import { create } from 'zustand';

const useGuestStore = create((set, get) => ({
	
  maximumObjects: 3,
  objectLimitGuest: 8,
	visitHistoryCount: 0,
  starredCount: 0,

  visitHistory: [],
  starred: [],

  loadGuestData: () => {
    const sortByTimestampDesc = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);

    let visitHistory = JSON.parse(localStorage.getItem('visitHistory')) || [];
    let starred = JSON.parse(localStorage.getItem('favorites')) || [];

    // Sort by timestamp if present, then apply limits
    visitHistory = visitHistory.sort(sortByTimestampDesc).slice(0, get().objectLimitGuest);
    starred = starred.sort(sortByTimestampDesc).slice(0, get().objectLimitGuest);

    // Correctly setting visitHistoryCount and starredCount inside the set call
    set({
      visitHistory,
      starred,
      visitHistoryCount: visitHistory.length,
      starredCount: starred.length,
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

