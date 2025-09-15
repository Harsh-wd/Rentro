import React, { useState, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'


const carImages = [
  assets.main_car,
  assets.traveller,
  assets.scooty,
];

const Hero = () => {
const [currentIndex, setCurrentIndex] = useState(0);
const[pickupLocation,setPickupLocation]=useState('')

const {pickupDate,setPickupDate,returnDate,setReturnDate,navigate}=useAppContext()

const handleSearch = (e)=>{
  e.preventDefault()
  navigate('/cars?pickupLocation='+pickupLocation + '&pickupDate='+pickupDate + '&returnDate=' + returnDate)
}


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carImages.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{duration:0.8}}
    className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center px-4 relative overflow-hidden'>
      <motion.h1 initial={{y:50,opacity:0}}
          animate={{y:0,opacity:1}}
          transition={{duration:0.8,delay:0.2}}
      className='text-4xl md:text-5xl font-semibold z-10'>
        Take Any Vehicle On Rent
      </motion.h1>

     
      <motion.form 
      initial={{scale:0.95,opacity:0,y:50}}
      animate={{scale:1,opacity:1,y:0}}
      transition={{duration:0.6,delay:0.4}}
      onSubmit={handleSearch} className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-1g md:rounded-full
       w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'>
        <div className='flex flex-col md:flex-row items-start md:items-center
        gap-10 min-md:ml-8'>
          <div className='flex flex-col items-start gap-2'>
            <select required value={pickupLocation} onChange={(e)=>
            setPickupLocation(e.target.value)}>
              <option value="">Pickup Location</option>
              {cityList.map((city)=> <option key={city} value={city}>{city}

              </option>)}
            </select>
            <p className='px-1 text-sm text-gray-500'>{pickupLocation ?
             pickupLocation : 'Please select location'}</p>
          </div>
          <div className='flex flex-col items-start gap-2'>
            <label htmlFor="pickup-date">Pick-up Date</label>
            <input value={pickupDate} onChange={e=>setPickupDate(e.target.value)} type="date" id="pickup-date" min={new Date().
              toISOString().split('T'[0])} className='text-sm text-gray-500' required />
          </div>
          <div className='flex flex-col items-start gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input value={returnDate} onChange={e=>setReturnDate(e.target.value)}
             type="date" id="return-date" className='text-sm text-gray-500' required />
          </div>

        </div >
        <motion.button 
        whileHover={{scale:1.05}}
        whileTap={{scale:0.95}}
        className='flex items-center justify-center gap-1 px-9
          py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white
          rounded-full cursor-pointer'>
          <img src={assets.search_icon} alt="search"
          className='brightness-300' />
          Search
          </motion.button>

      </motion.form>

      {/* Image Slider Container */}
      <div className="relative w-full max-w-4xl h-[250px] md:h-[400px] mt-4">
        {carImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`car-${index}`}
            className={`absolute left-1/2 top-0 -translate-x-1/2 object-contain max-h-full
               transition-opacity duration-1000 ease-in-out w-auto
              ${index === currentIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default Hero;
