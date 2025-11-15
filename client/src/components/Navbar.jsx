import React, { useState, useEffect,useRef } from 'react';
import { assets, menuLinks } from '../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import {motion} from 'motion/react'

const Navbar = () => {
    const { setShowLogin, user, logout, isOwner, axios, setIsOwner, cars } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [open, setOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const searchContainerRef = useRef(null); 

    const changeRole = async () => {
        try {
            const { data } = await axios.post('/api/owner/change-role');
            if (data.success) {
                setIsOwner(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Smart Search Logic
    useEffect(() => {
        if (searchQuery.trim() !== '' && Array.isArray(cars) && cars.length > 0) {
            const lowercasedQuery = searchQuery.toLowerCase();
            
            const filteredCars = cars.filter(car => {
                if (!car) return false;
                const nameMatch = car.name && car.name.toLowerCase().includes(lowercasedQuery);
                const brandMatch = car.brand && car.brand.toLowerCase().includes(lowercasedQuery);
                const modelMatch = car.model && car.model.toLowerCase().includes(lowercasedQuery);
                const categoryMatch = car.category && car.category.toLowerCase().includes(lowercasedQuery);

                return nameMatch || brandMatch || modelMatch || categoryMatch;
            });

            setSearchResults(filteredCars);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, cars]);


    // Close menu and search dropdown on route change
    useEffect(() => {
        setOpen(false);
        setIsSearchActive(false);
    }, [location.pathname]);

    // Logic to close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleResultClick = (carId) => {
        // Correct navigation path from your screenshot
        navigate(`/car-details/${carId}`);
        setSearchQuery('');
        setIsSearchActive(false);
    };

    return (
        <motion.div
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all 
            ${location.pathname === '/' && 'bg-light'}`}
        >
            <Link to='/'>
                <motion.img whileHover={{ scale: 1.10 }} src={assets.logo} alt="logo" className='h-14' />
            </Link>

            {open && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <div className={`transform max-sm:fixed max-sm:top-16 max-sm:right-0 max-sm:h-screen max-sm:w-4/5 
                max-sm:bg-white max-sm:z-50 max-sm:shadow-lg max-sm:border-l border-borderColor 
                flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4
                transition-transform duration-300 ease-in-out
                ${open ? 'max-sm:translate-x-0' : 'max-sm:translate-x-full'}`}>

                {menuLinks.map((link, index) => (
                    <Link
                        key={index}
                        to={link.path}
                        onClick={() => setOpen(false)}
                        className="hover:text-primary"
                    >
                        {link.name}
                    </Link>
                ))}

                <div 
                    ref={searchContainerRef}
                    className='relative hidden lg:flex items-center text-sm'
                >
                    <div className='flex items-center gap-2 border border-borderColor px-3 rounded-full w-56'>
                        <input
                            type="text"
                            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                            placeholder="Search Vehicles"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchActive(true)}
                        />
                        <img src={assets.search_icon} alt="search" />
                    </div>

                    {isSearchActive && searchQuery && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-borderColor rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map(car => (
                                    <div 
                                        key={car._id}
                                        onClick={() => handleResultClick(car._id)}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <img src={car.image || assets.placeholder_image} alt={car.name || car.brand} className="w-16 h-10 object-cover rounded"/>
                                        <span className="text-sm font-medium text-gray-800">{car.name || `${car.brand} ${car.model}`}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="p-3 text-sm text-center text-gray-500">No vehicles found</p>
                            )}
                        </div>
                    )}
                </div>

                <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
                    <button onClick={() => isOwner ? navigate('/owner') : changeRole()}
                        className="cursor-pointer">
                        {isOwner ? 'Dashboard' : 'List Vehicles'}
                    </button>

                    <button
                        onClick={() => { user ? logout() : setShowLogin(true) }}
                        className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg">
                        {user ? 'Logout' : 'Login'}
                    </button>
                </div>
            </div>

            <button className='sm:hidden z-50 relative cursor-pointer' aria-label="Menu" onClick={() => setOpen(!open)}>
                <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
            </button>
        </motion.div>
    );
};

export default Navbar;

