import React from 'react';

const MedicalServices = () => {
  const services = [
    { title: 'Child Health Records', buttonText: 'Child Health Records' },
    { title: 'Vaccination Tracking', buttonText: 'Vaccination Tracking' },
    { title: 'Doctor Consultation', buttonText: 'Doctor Consultation' },
    { title: 'Growth Monitoring', buttonText: 'Growth Monitoring' },
    { title: 'AI Health Insights', buttonText: 'AI Health Insights' },
  ];
  
  return (
    <div className="bg-gray-50 py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 mb-6 text-center">Our Aanganwadi Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 sm:p-5 md:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out w-full"
            >
              <div className="rounded-full bg-green-100 p-3 text-green-600 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold">{service.title.charAt(0)}</span>
              </div>
              <h3 className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-900 text-center">
                {service.title}
              </h3>
              <div className="mt-3 sm:mt-4 bg-green-300 text-green-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold w-full text-center cursor-default">
                {service.buttonText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalServices;