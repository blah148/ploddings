import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';

export default function ResizePanes({ displayVisitHistory, displayStarred, displayBeingWatched }) {
  const [isClient, setIsClient] = useState(false);
  const [size, setSize] = useState(100); // Size for the first pane
  const [size2, setSize2] = useState(100); // Size for the second pane

  useEffect(() => {
    // Component has mounted in the client, update state accordingly
    setIsClient(true);

    // Load sizes from localStorage on the client side
    const savedSize = localStorage.getItem('firstPane');
    const savedSize2 = localStorage.getItem('secondPane');

    if (savedSize) {
      setSize(parseInt(savedSize, 10));
    }

    if (savedSize2) {
      setSize2(parseInt(savedSize2, 10));
    }
  }, []);

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounce saving for the first pane
  const debounceSaveSize = debounce((newSize) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firstPane', newSize.toString());
    }
  }, 500); // Adjust debounce time as needed

  // Debounce saving for the second pane
  const debounceSaveSize2 = debounce((newSize) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondPane', newSize.toString());
    }
  }, 500); // Adjust debounce time as needed

  // Effect for saving size to localStorage, debounced
  useEffect(() => {
    debounceSaveSize(size);
  }, [size]); // Dependency array for the first pane

  // Effect for saving size2 to localStorage, debounced
  useEffect(() => {
    debounceSaveSize2(size2);
  }, [size2]); // Dependency array for the second pane

  const resizerStyle = {
    height: '5px',
    backgroundColor: 'red',
    cursor: 'row-resize',
		zIndex: 99999,
  };

  const paneStyle = {
    backgroundColor: 'gray',
    display: 'flex',
		flexDirection: 'column',
    alignItems: 'center',
		zIndex: 1,
    justifyContent: 'center', // Center content for demonstration
  };

  const outerStyle = {
    height: '80vh',
    backgroundColor: 'grey',
    margin: '10%',
  };

  if (!isClient) {
    return <div>Loading...</div>; // Or any other placeholder
  }

  return (
    <div style={outerStyle} className="outerContainer">
      <div className="sidebar" style={{ overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <SplitPane
          onChange={newSize => setSize(newSize)}
          split="horizontal"
          size={size}
          maxSize={-50}
          resizerStyle={resizerStyle}
          style={{ overflowY: 'auto', position: 'relative' }}
        >
          <div style={paneStyle}>
              <h2>Being Watched</h2>
              <ul>
                {displayBeingWatched.map((watch, index) => (
                  <li key={index}>
                    {watch.page_type} - {watch.name} - {watch.slug}
                  </li>
                ))}
              </ul>
          </div>
          <SplitPane
            onChange={newSize => setSize2(newSize)}
            maxSize={-50}
            split="horizontal"
            size={size2}
            resizerStyle={resizerStyle}
          >
            <div style={paneStyle}>
                <h2>Starred</h2>
                <ul>
                  {displayStarred.map((star, index) => (
                    <li key={index}>
                      {star.page_type} - {star.name} - {star.slug}
                    </li>
                  ))}
                </ul>
            </div>
            <div style={paneStyle}>
                <h2>Visit History</h2>
                <ul>
                  {displayVisitHistory.map((visit, index) => (
                    <li key={index}>
                      {visit.page_type} - {visit.name} - {visit.slug}
                    </li>
                  ))}
                </ul>
            </div>
          </SplitPane>
        </SplitPane>
      </div>
    </div>
  );
}

