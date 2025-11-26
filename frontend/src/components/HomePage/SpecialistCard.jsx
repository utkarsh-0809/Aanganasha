import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import React from "react";

export default function SpecialistCard() {
  const [openIndex, setOpenIndex] = useState(null);

  const specialists = [
    { id: 1, title: "CHILD HEALTH TRACKING" },
    { id: 2, title: "NUTRITION MONITORING" },
    { id: 3, title: "VACCINATION MANAGEMENT" },
    { id: 4, title: "GROWTH ASSESSMENT" },
    { id: 5, title: "DOCTOR VOLUNTEER PROGRAM" },
    { id: 6, title: "AI HEALTH INSIGHTS" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-gray-100 px-3 sm:px-4 md:px-6">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-green-500 font-light leading-relaxed tracking-wide text-center mb-4 sm:mb-6 md:mb-8">
        OUR AANGANWADI FEATURES
      </h2>
      <div className="w-full max-w-5xl">
        {specialists.map((specialist, index) => (
          <div key={specialist.id} className="mb-3 sm:mb-4 md:mb-6">
            <div
              className="bg-green-100 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg flex justify-between items-center cursor-pointer w-full transition-all duration-300 ease-in-out"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
                <span className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-thin">{`0${specialist.id}`}</span>
                <span className="text-sm sm:text-base md:text-lg lg:text-2xl font-semibold text-gray-800">{specialist.title}</span>
              </div>
              {openIndex === index ? 
                <Minus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-800" /> : 
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-800" />
              }
            </div>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="overflow-hidden bg-white p-3 sm:p-4 md:p-6 text-gray-700 rounded-b-xl sm:rounded-b-2xl w-full mt-1"
                >
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700">
                    Specialized care and monitoring for children's health and development in Aanganwadi centers.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}