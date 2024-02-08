// store.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(persist(
  (set) => ({
    // Initial sizes for the first pane and the division of the second and third panes
    paneSizes: ['33.33%', '50%'], // Represents the size for the first pane and the initial division for the second
    setPaneSizes: (sizes) => set({ paneSizes: sizes }),
  }),
  {
    name: 'pane-sizes-storage', // localStorage key
  }
));

export default useStore;

