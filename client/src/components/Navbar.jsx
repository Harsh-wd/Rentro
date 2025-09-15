import React, { useState, useEffect } from 'react';
import { assets, menuLinks } from '../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import {motion} from 'motion/react'

const Navbar = () => {
      const {setShowLogin,user,logout,isOwner,axios,setIsOwner}=useAppContext()

  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const changeRole = async()=>{
    try {
      const {data}=await axios.post('/api/owner/change-role')
      if (data.success){
        setIsOwner(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
  } catch (error) {
      toast.error(error.message)
  }
}
  // Close menu on route change
  useEffect(() => {
    setOpen(false); 
  }, [location.pathname]);

  // Close on Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <motion.div 
    initial={{y: -15,opacity:0}}
    animate={{y:0,opacity:2}}
    transition={{duration:0.5}}
    className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all 
      ${location.pathname === '/' &&'bg-light'}`}>

      {/* Logo */}
      <Link to='/'>
        <motion.img whileHover={{scale:1.10}} src={assets.logo} alt="logo" className='h-14' />
      </Link>

      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Nav Menu */}
      <div className={`transform max-sm:fixed max-sm:top-16 max-sm:right-0 max-sm:h-screen max-sm:w-4/5 
        max-sm:bg-white max-sm:z-50 max-sm:shadow-lg max-sm:border-l border-borderColor 
        flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4
        transition-transform duration-300 ease-in-out
        ${open ? 'max-sm:translate-x-0' : 'max-sm:translate-x-full'}`}>

        {/* Menu Links */}
        {menuLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            onClick={() => setOpen(false)} // close on link click
            className="hover:text-primary"
          >
            {link.name}
          </Link>
        ))}

        {/* Search */}
        <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search Vehicles"
          />
          <img src={assets.search_icon} alt="search" />
        </div>

        {/* Action Buttons */}
        <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
          <button onClick={() => isOwner ?  navigate('/owner'):changeRole() }
           className="cursor-pointer">
            { isOwner ? 'Dashboard' : 'List Cars'}
          </button>

          <button
            onClick={() => {user ? logout() : setShowLogin(true)}}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg">
           {user ? 'Logout': 'Login'}</button>
        </div>
      </div>

      {/* Toggle Button */}
      <button className='sm:hidden z-50 relative cursor-pointer' aria-label="Menu" onClick={() => setOpen(!open)}>
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </motion.div>
  )
}

export default Navbar;
