import React from 'react'
import Title from './Title'
import { assets } from '../assets/assets';
import {motion} from 'motion/react'

const Testimonial = () => {
     const testimonials = [
        { name: "Vivek Sharma",
         location: "Jodhpur",
        image: assets.testimonial1,
        testimonial: "Rented a sedan for a solo road trip and had a great experience.The customer support was responsive and the car was in excellent condition. Rentro is now my go-to!",
    },
    { name: "Vishwas Joshi",
         location: "Ahemdabad",
        image: assets.testimonial2,
        testimonial: "I was visiting for a client meeting and booked a car last-minute. Rentro made it incredibly easy. The rates were fair and the pickup was hassle-free.",
    },
    { name: "Sunny",
         location: "Goa",
        image: assets.testimonial3,
        testimonial: "I needed a bike for my college commute, and Rentro had the perfect option at a budget-friendly rate. Booking was instant, and I had the bike delivered in under an hour!",
    }
     ];
  return (
    <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">
        <Title title="What Our Customers Say" SubTitle="Discover why customers across the country
         trust Rentro for affordable and reliable vehicle rentals."/>          

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
                {testimonials.map((testimonial,index) => (
                    <motion.div
                    initial={{opacity:0,y:40}}
                    whileInView={{opacity:1,y:0}}
                    transition={{duration:0.6,delay:index*0.2,ease:'easeOut'}}
                    viewport={{once:true,amount:0.3}}                     
                    key={index} className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500">
                        <div className="flex items-center gap-3">
                            <img className="w-12 h-12 rounded-full" src={testimonial.image} alt={testimonial.name} />
                            <div>
                                <p className="text-xl">{testimonial.name}</p>
                                <p className="text-gray-500">{testimonial.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4">
                            {Array(5).fill(0).map((_, index) => (
                                <img key={index} src={assets.star_icon1}
                                 alt="star-icon" />
                            ))}
                        </div>
                        <p className="text-gray-500 max-w-90 mt-4 font-light">"{testimonial.testimonial}"</p>
                    </motion.div>
                ))}
            </div>
        </div>
  )
}

export default Testimonial
