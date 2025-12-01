
import { useEffect, useState } from 'react';
import { useSidebarContext } from '../contexts/SidebarContext';
import { useLocation } from 'react-router-dom';
import SidebarLogo from './sidebar/SidebarLogo';
import SidebarSearch from './sidebar/SidebarSearch';
import SidebarNavigation from './sidebar/SidebarNavigation';
import SidebarUserProfile from './sidebar/SidebarUserProfile';
import SidebarToggle from './sidebar/SidebarToggle';
import CustomSlider from './sidebar/CustomSlider';

const DarkSidebar = () => {
  const { isOpen, setIsOpen } = useSidebarContext();
  const location = useLocation();
  const [autoOffEnabled, setAutoOffEnabled] = useState(() => {
    const saved = localStorage.getItem('sidebar-auto-off');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handleAutoOffChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAutoOffEnabled(customEvent.detail.value);
    };

    window.addEventListener('auto-off-changed', handleAutoOffChanged);
    return () => window.removeEventListener('auto-off-changed', handleAutoOffChanged);
  }, []);

  useEffect(() => {
    if (autoOffEnabled && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, autoOffEnabled, isOpen, setIsOpen]);


  return (
    <div className={`
        fixed left-0 top-0 h-screen bg-[#161618] transition-all duration-500 ease-out z-50
        border-r border-[#1C1C1C] flex flex-col
        ${isOpen ? 'w-[260px]' : 'w-[70px]'}
      `}>

      <CustomSlider isOpen={isOpen} className="flex-1 w-full overflow-hidden">
        <SidebarLogo isOpen={isOpen} />
        <SidebarSearch isOpen={isOpen} />
        <SidebarNavigation isOpen={isOpen} setIsOpen={setIsOpen} />
      </CustomSlider>
      
      <div className="flex-shrink-0">
        {isOpen ? (
          <div className="p-4 border-t border-[#1C1C1C] flex items-center justify-between animate-fade-in transition-all duration-300 ease-out">
            <SidebarUserProfile isOpen={isOpen} />
            <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
          </div>
        ) : (
          <div className="p-4 border-t border-[#1C1C1C] flex flex-col items-center gap-2 animate-fade-in transition-all duration-300 ease-out">
            <SidebarUserProfile isOpen={isOpen} />
            <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DarkSidebar;
