import { useState, useEffect } from 'react';

const TabsComponent = () => {

  const [selectedTab, setSelectedTab] = useState(null);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
		localStorage.setItem('selectedTab', tab);
  };

	useEffect (() => {
		if (typeof window !== 'undefined') {
		 if (selectedTab === null && localStorage.getItem('selectedTab') !== null) {
				// Convert string in localStorage to a number
				const storedTab = parseInt(localStorage.getItem('selectedTab'), 10);
				setSelectedTab(storedTab);
			}	
			
			else if (selectedTab === null && localStorage.getItem('selectedTab') === null) {
				setSelectedTab(1);
			}
		}
	}, [selectedTab]);


  return (
    <div>
      <div className="tabs">
        <button className={selectedTab === 1 ? 'active' : ''} onClick={() => handleTabClick(1)}>Tab 1</button>
        <button className={selectedTab === 2 ? 'active' : ''} onClick={() => handleTabClick(2)}>Tab 2</button>
      </div>
      <div className="tab-content">
        <div style={{ display: selectedTab === 1 ? 'block' : 'none' }} className={selectedTab === 1 ? 'tab-pane active' : 'tab-pane'}>Tab 1 content</div>
        <div style={{ display: selectedTab === 2 ? 'block' : 'none' }} className={selectedTab === 2 ? 'tab-pane active' : 'tab-pane'}>Tab 2 content</div>
      </div>
    </div>
  );

};

export default TabsComponent;
