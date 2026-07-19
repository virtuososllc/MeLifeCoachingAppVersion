import React from 'react';
import {
  Home, Zap, User, MessageSquare,
  Users, CalendarDays, BookOpen,
  Info, Phone, LogIn, UserPlus, LayoutDashboard, LogOut,ClipboardPen,
  
} from 'lucide-react';

const USER_TABS = [
  { label: 'Dashboard',   tab: 'dashboard',   Icon: Home          },
  // { label: 'Flashcards',  tab: 'flashcards',  Icon: Zap           },
  { label: 'Profile',     tab: 'profile',     Icon: User          },
  { label: 'Reflections', tab: 'reflections', Icon: MessageSquare },
  { label: 'Assignments', tab: 'assignments', Icon: BookOpen      },
  { label: 'Logout',      tab: 'logout',      Icon: LogOut        },
];

const ADMIN_TABS = [
  { label: 'Users',       tab: 'users',       Icon: Users         },
  { label: 'Sessions',    tab: 'sessions',    Icon: CalendarDays  },
  { label: 'Reflections', tab: 'reflections', Icon: MessageSquare },
  { label: 'Profile',     tab: 'profile',     Icon: User          },
  { label: 'Assignments', tab: 'assignments', Icon: BookOpen      },
  { label: 'Testimonials', tab: 'testimonials', Icon: ClipboardPen },
  { label: 'Logout',      tab: 'logout',      Icon: LogOut        },
];

const HOME_GUEST_TABS = [
  { label: 'Home',     tab: 'home',     Icon: Home      },
  { label: 'Program',  tab: 'program',  Icon: Info      },
  { label: 'Contact',  tab: 'contact',  Icon: Phone     },
  { label: 'Login',    tab: 'login',    Icon: LogIn     },
  { label: 'Register', tab: 'register', Icon: UserPlus  },
];

const HOME_AUTH_TABS = [
  { label: 'Home',      tab: 'home',      Icon: Home            },
  { label: 'Program',   tab: 'program',   Icon: Info            },
  { label: 'Contact',   tab: 'contact',   Icon: Phone           },
  { label: 'Dashboard', tab: 'dashboard', Icon: LayoutDashboard },
];

const PWABottomNav = ({
  activeTab,
  onTabChange,
  onLogout,
  isAdmin    = false,
  isHomePage = false,
  isLoggedIn = false,
}) => {
  let tabs;

  if (isHomePage) {
    tabs = isLoggedIn ? HOME_AUTH_TABS : HOME_GUEST_TABS;
  } else if (isAdmin) {
    tabs = ADMIN_TABS;
  } else {
    tabs = USER_TABS;
  }

  const handleClick = (tab) => {
    if (tab === 'logout') {
      onLogout?.();
    } else {
      onTabChange(tab);
    }
  };

  return (
    <nav
      className="pwa-bottom-nav"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      aria-label="App navigation"
    >
      {tabs.map(({ label, tab, Icon }) => {
        const active  = activeTab === tab;
        const isLogout = tab === 'logout';

        return (
          <button
            key={tab}
            className={`pwa-nav-item${active ? ' pwa-nav-item--active' : ''}${isLogout ? ' pwa-nav-item--danger' : ''}`}
            onClick={() => handleClick(tab)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="pwa-nav-icon-wrap">
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
            </span>
            <span className="pwa-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default PWABottomNav;