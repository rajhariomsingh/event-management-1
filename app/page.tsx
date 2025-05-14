'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  hostId: number;
  invitees: User[];
  requests: User[];
  unreadInvites: User[];
  image?: string;
  category?: string;
}

type OperationResult = {
  message: string;
  type: 'success' | 'error';
} | null;

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
  { id: 3, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 4, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com' },
];

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Birthday Party',
    description: 'Celebrating John\'s birthday with friends and family. Join us for cake, games, and fun!',
    date: '2024-09-20',
    time: '18:00',
    location: 'John\'s House, 123 Main St',
    hostId: 1,
    invitees: [],
    requests: [],
    unreadInvites: [],
    image: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'social',
  },
  {
    id: 2,
    title: 'Wedding',
    description: 'Jane and Bob\'s wedding ceremony followed by reception. Smart casual dress code.',
    date: '2024-10-15',
    time: '12:00',
    location: 'Local Church & Grand Hotel',
    hostId: 2,
    invitees: [],
    requests: [],
    unreadInvites: [],
    image: 'https://images.pexels.com/photos/1114425/pexels-photo-1114425.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'formal',
  },
  {
    id: 3,
    title: 'Tech Meetup',
    description: 'Monthly tech community meeting to discuss latest trends in web development.',
    date: '2024-09-12',
    time: '19:00',
    location: 'Tech Hub, Downtown',
    hostId: 3,
    invitees: [],
    requests: [],
    unreadInvites: [],
    image: 'https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'professional',
  },
  {
    id: 4,
    title: 'Charity Run',
    description: '5K run to raise money for local hospital. All fitness levels welcome.',
    date: '2024-10-05',
    time: '08:00',
    location: 'City Park',
    hostId: 4,
    invitees: [],
    requests: [],
    unreadInvites: [],
    image: 'https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'sports',
  },
  {
    id: 5,
    title: 'Book Club',
    description: 'Discussion of "The Great Gatsby" by F. Scott Fitzgerald. New members welcome!',
    date: '2024-09-18',
    time: '20:00',
    location: 'Community Library',
    hostId: 5,
    invitees: [],
    requests: [],
    unreadInvites: [],
    image: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'educational',
  }
];

const eventCategories = [
  { value: 'all', label: 'All Events' },
  { value: 'social', label: 'Social' },
  { value: 'professional', label: 'Professional' },
  { value: 'educational', label: 'Educational' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'formal', label: 'Formal' }
];

function App() {
  const [users] = useState<User[]>(mockUsers);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRequestNotifications, setShowRequestNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [operationResult, setOperationResult] = useState<OperationResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      setCurrentUser(randomUser);
      localStorage.setItem('currentUser', JSON.stringify(randomUser));
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const hostEvents = events.filter(event => event.hostId === currentUser.id);
      const requestNotifications = hostEvents.reduce((count, event) => {
        return count + event.requests.length;
      }, 0);
      
      const inviteNotifications = events.reduce((count, event) => {
        return count + event.unreadInvites.filter(invite => 
          invite.id === currentUser.id
        ).length;
      }, 0);
      
      setUnreadNotifications(requestNotifications + inviteNotifications);
    }
  }, [events, currentUser]);

  const handleClickOutside = (event: MouseEvent) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
      setShowRequestNotifications(false);
    }
    if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
      setShowUserDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (showCreateEventModal && !document.querySelector('.modal-content')?.contains(event.target as Node)) {
        setShowCreateEventModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideModal);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideModal);
    };
  }, [showCreateEventModal]);

  // Close modals with Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCreateEventModal(false);
        setShowEventDetails(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const userEvents = filteredEvents.filter(event => 
    event.hostId === currentUser?.id || 
    event.invitees.some(invitee => invitee.id === currentUser?.id)
  );

  const handleCreateEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      title: HTMLInputElement;
      description: HTMLInputElement;
      date: HTMLInputElement;
      time: HTMLInputElement;
      location: HTMLInputElement;
      category: HTMLSelectElement;
      imageUrl: HTMLInputElement;
    };

    const newEvent: Event = {
      id: events.length + 1,
      title: formElements.title.value,
      description: formElements.description.value,
      date: formElements.date.value,
      time: formElements.time.value,
      location: formElements.location.value,
      hostId: currentUser!.id,
      invitees: [],
      requests: [],
      unreadInvites: [],
      category: formElements.category.value,
      image: formElements.imageUrl.value || undefined,
    };

    setTimeout(() => {
      setEvents([...events, newEvent]);
      setShowCreateEventModal(false);
      setOperationResult({ message: 'Event created successfully!', type: 'success' });
      setIsLoading(false);
      
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }, 1500);
  };

  const handleInviteUser = (eventId: number, userId: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          const userToInvite = users.find(user => user.id === userId);
          if (userToInvite && !event.invitees.some(invitee => invitee.id === userId)) {
            return {
              ...event,
              invitees: [...event.invitees, userToInvite],
              unreadInvites: [...event.unreadInvites, userToInvite]
            };
          }
        }
        return event;
      });
      setEvents(updatedEvents);
      setOperationResult({ message: 'User invited successfully!', type: 'success' });
      setIsLoading(false);
      
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }, 1500);
  };
  
  const markInviteAsRead = (eventId: number, userId: number) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          unreadInvites: event.unreadInvites.filter(user => user.id !== userId)
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleRequestToJoin = (eventId: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          if (!event.requests.some(request => request.id === currentUser!.id)) {
            return {
              ...event,
              requests: [...event.requests, currentUser!]
            };
          }
        }
        return event;
      });
      setEvents(updatedEvents);
      setOperationResult({ message: 'Request to join sent successfully!', type: 'success' });
      setIsLoading(false);
      
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }, 1500);
  };

  const handleAcceptRequest = (eventId: number, userId: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          const userToAccept = event.requests.find(request => request.id === userId);
          if (userToAccept && !event.invitees.some(invitee => invitee.id === userId)) {
            return {
              ...event,
              invitees: [...event.invitees, userToAccept],
              requests: event.requests.filter(request => request.id !== userId)
            };
          }
        }
        return event;
      });
      setEvents(updatedEvents);
      setOperationResult({ message: 'Request accepted successfully!', type: 'success' });
      setIsLoading(false);
      
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }, 1500);
  };

  const handleDeclineRequest = (eventId: number, userId: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            requests: event.requests.filter(request => request.id !== userId)
          };
        }
        return event;
      });
      setEvents(updatedEvents);
      setOperationResult({ message: 'Request declined successfully!', type: 'success' });
      setIsLoading(false);
      
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }, 1500);
  };

  const handleDeleteEvent = (eventId: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setEvents(events.filter(event => event.id !== eventId));
      setShowEventDetails(false);
      setSelectedEvent(null);
      setOperationResult({ message: 'Event deleted successfully!', type: 'success' });
      setIsLoading(false);
      
      setTimeout(() => {
        setOperationResult(null);
      }, 3000);
    }, 1500);
  };

  const handleShowEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleDateClick = () => {
    setShowDatePicker(!showDatePicker);
    setShowTimePicker(false);
  };

  const handleTimeClick = () => {
    setShowTimePicker(!showTimePicker);
    setShowDatePicker(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100"
      style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header 
        className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm sticky top-0 z-10"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-md opacity-30 animate-pulse-slow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 7v10M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 font-sans">
              EventSphere
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            {currentUser && (
              <motion.div 
                className="relative"
                ref={notificationsRef}
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => setShowRequestNotifications(!showRequestNotifications)}
                  className="relative cursor-pointer p-3 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0H4.97" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <motion.span
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={unreadNotifications.toString()}
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {showRequestNotifications && (
                    <motion.div
                      className="absolute right-0  mt-3 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 py-1 border border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Notifications
                        </h3>
                      </div>
                      
                      <div className="max-h-96 overflow-auto">
                        {/* Invitations Section */}
                        {events.filter(event => 
                          event.unreadInvites.some(invite => invite.id === currentUser?.id)
                        ).length > 0 && (
                          <div className="pt-2 pb-1 px-4 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Event Invitations
                            </h4>
                          </div>
                        )}
                        
                        {events.filter(event => 
                          event.unreadInvites.some(invite => invite.id === currentUser?.id)
                        ).map(event => (
                          <div key={`invite-${event.id}`} className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {event.title}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {event.date} at {event.time}
                                </p>
                              </div>
                              <motion.button
                                onClick={() => {
                                  markInviteAsRead(event.id, currentUser!.id);
                                  handleShowEventDetails(event);
                                  setShowRequestNotifications(false);
                                }}
                                className="text-xs cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-full transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View
                              </motion.button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                              You've been invited by {users.find(user => user.id === event.hostId)?.name}
                            </p>
                          </div>
                        ))}
                        
                        {events.filter(event => 
                          event.hostId === currentUser?.id && event.requests.length > 0
                        ).length > 0 && (
                          <div className="pt-2 pb-1 px-4 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Join Requests
                            </h4>
                          </div>
                        )}
                        
                        {events.filter(event => 
                          event.hostId === currentUser?.id && event.requests.length > 0
                        ).map(event => (
                          <div key={`request-${event.id}`} className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              {event.title}
                            </h4>
                            {event.requests.map(request => (
                              <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                                    {request.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm text-gray-800 dark:text-gray-200">{request.name}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAcceptRequest(event.id, request.id)}
                                    className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
                                    disabled={isLoading}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeclineRequest(event.id, request.id)}
                                    className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                                    disabled={isLoading}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </motion.button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                        
                        {!events.some(event => 
                          (event.hostId === currentUser?.id && event.requests.length > 0) || 
                          event.unreadInvites.some(invite => invite.id === currentUser?.id)
                        ) && (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            
            <motion.div 
              className="relative"
              ref={userDropdownRef}
              variants={itemVariants}
            >
              <motion.button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex cursor-pointer items-center space-x-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentUser?.name}</span>
                
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
              
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 py-1 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                          {currentUser?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Switch User
                      </p>
                      
                      {users.filter(user => user.id !== currentUser?.id).map(user => (
                        <motion.button
                          key={user.id}
                          onClick={() => {
                            setCurrentUser(user);
                            localStorage.setItem('currentUser', JSON.stringify(user));
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex cursor-pointer items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.header>
      
      {/* Main content */}
      <main className="px-6 py-8 max-w-7xl mx-auto w-full flex-grow">
        {/* Tutorial / about section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => setShowTutorial(!showTutorial)}
            className="w-full flex cursor-pointer items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-left hover:shadow-md transition-shadow duration-200"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">About EventSphere</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Learn how to use the app and get the most out of your events
                </p>
              </div>
            </div>
            <div className="ml-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${showTutorial ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </motion.button>
          
          <AnimatePresence>
            {showTutorial && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 mt-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-700 dark:text-gray-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-xs">1</span>
                        Creating Events
                      </h4>
                      <p className="text-sm mb-2">
                        Click the "Create Event" button to start a new event. Fill in all the details including title, description, date, time, and location.
                      </p>
                      <p className="text-sm mb-2">
                        As the host, you can invite others and approve join requests.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-xs">2</span>
                        Finding Events
                      </h4>
                      <p className="text-sm mb-2">
                        Use the search bar to find specific events by title, description, or location.
                      </p>
                      <p className="text-sm mb-2">
                        Filter events by category using the dropdown menu to narrow your results.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-xs">3</span>
                        Managing Notifications
                      </h4>
                      <p className="text-sm mb-2">
                        Check your notifications for event invitations and join requests.
                      </p>
                      <p className="text-sm mb-2">
                        All notifications are shown in the bell icon in the header.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-xs">4</span>
                        Event Details
                      </h4>
                      <p className="text-sm mb-2">
                        Click on any event card to view full details, see attendees, and manage requests.
                      </p>
                      <p className="text-sm mb-2">
                        From the details page, you can request to join events or invite others if you're the host.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      Pro Tips
                    </h4>
                    <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        Switch between users to test different perspectives (host vs attendee).
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        You'll receive notifications when someone requests to join your event or when you're invited to an event.
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        Click on an event card to see full details and manage your RSVPs.
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div
          className="mb-8 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full cursor-pointer pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search events by title, description or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Category filters */}
            <div className="md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                </div>
                <select
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {eventCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active filters display */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex cursor-pointer items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Search: {searchTerm}
                    <button 
                      className="ml-1"
                      onClick={() => setSearchTerm('')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Category: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    <button 
                      className="ml-1"
                      onClick={() => setSelectedCategory('all')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Events header */}
        <motion.div 
          className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0"
          variants={itemVariants}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 relative inline-block">
              Your Events
              <span className="absolute -top-2 -right-3 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {userEvents.length}
              </span>
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl">
              Manage your events and invitations in one place. Keep track of who's joining and who's requested to join.
            </p>
          </motion.div>
          
          <motion.button
            onClick={() => setShowCreateEventModal(true)}
            className="bg-gradient-to-r cursor-pointer from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md flex items-center space-x-2"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Create Event</span>
          </motion.button>
        </motion.div>
        
        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {userEvents.map((event, index) => {
              const isEventHost = event.hostId === currentUser?.id;
              
              return (
                <motion.div
                  key={event.id}
                  layoutId={`event-card-${event.id}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
                  whileHover={{ 
                    y: -4,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    layoutId: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                  }}
                  onClick={() => handleShowEventDetails(event)}
                >
                  <div 
                    className="h-48 relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white overflow-hidden"
                  >
                    {/* Background image with overlay */}
                    {event.image && (
                      <div className="absolute inset-0">
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-blue-600/80"></div>
                      </div>
                    )}
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-tr-full -ml-6 -mb-6 z-0"></div>
                    
                    {/* Host badge */}
                    {isEventHost && (
                      <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full border border-white/30 shadow-sm z-10">
                        Host
                      </span>
                    )}
                    
                    {/* Category badge */}
                    {event.category && (
                      <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full border border-white/30 shadow-sm z-10">
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                    )}
                    
                    {/* Event title and details */}
                    <div className="relative z-10 mt-8">
                      <div className="flex items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 2v4M16 2v4" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 14v4M16 14v4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h3 className="text-lg font-medium">{event.title}</h3>
                      </div>
                      
                      <div className="flex items-center text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{event.date} at {event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    {/* Attendees */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                      <div className="flex items-center">
                        {event.invitees.slice(0, 3).map(invitee => (
                          <div key={invitee.id} className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-medium -mr-2 border border-white/50 shadow-sm">
                            {invitee.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {event.invitees.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-medium -mr-2 border border-white/50 shadow-sm">
                            +{event.invitees.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{event.invitees.length} going</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Event description */}
                  <div className="p-5">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Empty state */}
        {userEvents.length === 0 && (
          <motion.div 
            className="text-center py-12 px-6 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 7v10M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No events found</h3>
            {(searchTerm || selectedCategory !== 'all') ? (
              <p className="text-base text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                No events match your current search criteria. Try adjusting your filters or create a new event.
              </p>
            ) : (
              <p className="text-base text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't created or been invited to any events yet. Create your first event to get started!
              </p>
            )}
            <motion.button
              onClick={() => setShowCreateEventModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Create Event</span>
            </motion.button>
          </motion.div>
        )}
      </main>
      
      {/* Footer */}
      <motion.footer 
        className="mt-auto py-8 px-6 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-md opacity-30"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 7v10M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 font-sans">
                  EventSphere
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Simplifying event planning and management for everyone. Create, join, and enjoy events with your community.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="https://facebook.com" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a href="https://instagram.com" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    About
                  </a>
                </li>
                
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    123 Innovation Way<br />
                    Tech Valley, CA 94043
                  </span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">support@eventsphere.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-400">
              © {new Date().getFullYear()} EventSphere. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
      
      {/* Modals */}
      <AnimatePresence>
        {/* Event details modal */}
        {showEventDetails && selectedEvent && (() => {
           const isEventHost = selectedEvent?.hostId === currentUser?.id;
           const isUserInvited = selectedEvent?.invitees.some(u => u.id === currentUser?.id);
           const hasUserRequested = selectedEvent?.requests.some(u => u.id === currentUser?.id);
            return (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCloseEventDetails();
                }
              }}
            />
           
            
            <motion.div
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-40 w-full max-w-2xl mx-4 modal-content overflow-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {selectedEvent.image && (
                <div className="relative h-40 overflow-hidden rounded-t-xl">
                  <img 
                    src={selectedEvent.image} 
                    alt={selectedEvent.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
                  
                  {/* Category badge */}
                  {selectedEvent.category && (
                    <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full border border-white/30 shadow-sm">
                      {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                    </span>
                  )}
                  
                  {/* Close button */}
                  <motion.button
                    onClick={handleCloseEventDetails}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors rounded-full p-1.5 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 relative inline-block">
                      {selectedEvent.title}
                      {isEventHost && (
                        <span className="absolute -top-2 -right-3 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                          H
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{selectedEvent.date} at {selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                  
                  {/* If not visible due to the image header, show close button here too */}
                  {!selectedEvent.image && (
                    <motion.button
                      onClick={handleCloseEventDetails}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.button>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Attendees</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedEvent.invitees.length} {selectedEvent.invitees.length === 1 ? 'person' : 'people'} attending
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.invitees.map(invitee => (
                      <div key={invitee.id} className="flex items-center space-x-2 py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-full text-sm">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                          {invitee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-800 dark:text-gray-200">{invitee.name}</span>
                      </div>
                    ))}
                    {selectedEvent.invitees.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                        No attendees yet
                      </p>
                    )}
                  </div>
                </div>
                
                {isEventHost && (
                  <div className="mb-6">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Pending Requests</h3>
                    {selectedEvent.requests.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEvent.requests.map(request => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                                {request.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-800 dark:text-gray-200">{request.name}</span>
                            </div>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAcceptRequest(selectedEvent.id, request.id)}
                                className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
                                disabled={isLoading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeclineRequest(selectedEvent.id, request.id)}
                                className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                                disabled={isLoading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No pending requests
                      </p>
                    )}
                  </div>
                )}
                
                {users.filter(user => 
                  !selectedEvent.invitees.some(invitee => invitee.id === user.id) && 
                  user.id !== selectedEvent.hostId
                ).length > 0 && isEventHost && (
                  <div className="mb-6">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Invite People</h3>
                    <div className="space-y-3">
                      {users.filter(user => 
                        !selectedEvent.invitees.some(invitee => invitee.id === user.id) && 
                        user.id !== selectedEvent.hostId
                      ).map(user => (
                        <motion.div 
                          key={user.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-md">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInviteUser(selectedEvent.id, user.id)}
                            className="p-1.5 rounded-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
                            disabled={isLoading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  {/* Action buttons based on user role */}
                  <div>
                    {isEventHost && (
                      <motion.button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="bg-red-500 hover:bg-red-600 cursor-pointer text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        <span>Delete Event</span>
                      </motion.button>
                    )}
                  </div>
                  
                  <div>
                    {!isEventHost && !isUserInvited && !hasUserRequested && (
                      <motion.button
                        onClick={() => handleRequestToJoin(selectedEvent.id)}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md flex items-center space-x-2"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Requesting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 9l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M4 4v7a4 4 0 0 0 4 4h11" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Request to Join
                          </>
                        )}
                      </motion.button>
                    )}
                    
                    {!isEventHost && isUserInvited && (
                      <motion.div
                        className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        You're going!
                      </motion.div>
                    )}
                    
                    {!isEventHost && hasUserRequested && (
                      <motion.div
                        className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 9l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 4v7a4 4 0 0 0 4 4h11" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Request sent!
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
           );
        })()}
       
        
        {/* Create event modal */}
        {showCreateEventModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowCreateEventModal(false);
                }
              }}
            />
            
            <motion.div
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-40 w-full max-w-md mx-4 modal-content overflow-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 relative inline-block">
                    Create Event
                  </h2>
                  <motion.button
                    onClick={() => setShowCreateEventModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </div>
                
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  {/* Event title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Title</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 7v10M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Event title"
                      />
                    </div>
                  </div>
                  
                  {/* Event description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <textarea
                        id="description"
                        name="description"
                        required
                        rows={3}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Event description"
                      />
                    </div>
                  </div>
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Date */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          id="date"
                          name="date"
                          required
                          readOnly
                          onClick={handleDateClick}
                          ref={dateInputRef}
                          className="w-full pl-10 pr-3 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
                          placeholder="Select date"
                        />
                        {showDatePicker && (
                          <div className="absolute left-0 top-full mt-1 z-10">
                            <input
                              type="date"
                              autoFocus
                              onChange={(e) => {
                                const dateValue = e.target.value;
                                if (dateInputRef.current) {
                                  dateInputRef.current.value = dateValue;
                                }
                                setShowDatePicker(false);
                              }}
                              className="rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          id="time"
                          name="time"
                          required
                          readOnly
                          onClick={handleTimeClick}
                          ref={timeInputRef}
                          className="w-full pl-10 pr-3 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
                          placeholder="Select time"
                        />
                        {showTimePicker && (
                          <div className="absolute left-0 top-full mt-1 z-10">
                            <input
                              type="time"
                              autoFocus
                              onChange={(e) => {
                                const timeValue = e.target.value;
                                if (timeInputRef.current) {
                                  timeInputRef.current.value = timeValue;
                                }
                                setShowTimePicker(false);
                              }}
                              className="rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Event location"
                      />
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                      </span>
                      <select
                        id="category"
                        name="category"
                        className="w-full pl-10 pr-10 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        {eventCategories.filter(cat => cat.value !== 'all').map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image URL */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Image URL (optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        ref={imageUrlRef}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-end mt-6">
                    <motion.button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md flex items-center space-x-2"
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Create Event
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Notifications toast */}
      <AnimatePresence>
        {operationResult && (
          <motion.div
            className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 flex items-center space-x-3 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${operationResult.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {operationResult.type === 'success' ? (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ) : (
                  <>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{operationResult.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    
  );
}

export default App;