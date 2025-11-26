import React from 'react';

const ProblemsSection = () => {
  const problems = [
    {
      id: 1,
      statistic: "1.2 Million",
      description: "Children drop out of school every year in India",
      image: "/./src/assets/poor-children-1.avif",
      textColor: "text-red-700",
      accentColor: "bg-red-500",
      fallbackBg: "bg-red-50"
    },
    {
      id: 2,
      statistic: "21%",
      description: "Children under 5 are underweight due to malnutrition",
      image: "/./src/assets/poor-children-2.avif",
      textColor: "text-orange-700",
      accentColor: "bg-orange-500",
      fallbackBg: "bg-orange-50"
    },
    {
      id: 3,
      statistic: "38.4%",
      description: "Children under 5 are stunted due to chronic malnutrition",
      image: "/./src/assets/poor-children-3.jpg",
      textColor: "text-yellow-700",
      accentColor: "bg-yellow-500",
      fallbackBg: "bg-yellow-50"
    },
    {
      id: 4,
      statistic: "2.5 Crore",
      description: "Children are out of school in India",
      image: "/./src/assets/poor-children-4.avif",
      textColor: "text-purple-700",
      accentColor: "bg-purple-500",
      fallbackBg: "bg-purple-50"
    },
    {
      id: 5,
      statistic: "70%",
      description: "Rural children lack access to quality early childhood education",
      image: "/./src/assets/poor-children-5.jpg",
      textColor: "text-blue-700",
      accentColor: "bg-blue-500",
      fallbackBg: "bg-blue-50"
    },
    {
      id: 6,
      statistic: "1,20,000",
      description: "Children die annually due to preventable diseases in India",
      image: "/./src/assets/poor-children-6.jpg",
      textColor: "text-indigo-700",
      accentColor: "bg-indigo-500",
      fallbackBg: "bg-indigo-50"
    }
  ];

  return (
    <div className="w-full bg-gray-50 py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-green-500 font-light leading-relaxed tracking-wide mb-4 sm:mb-6">
          THE REALITY OF CHILD WELFARE IN INDIA
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-800 font-medium leading-relaxed tracking-wide max-w-4xl mx-auto">
          Aanganwadis serve as beacons of hope, addressing critical challenges faced by millions of children across rural and urban India. 
          Here are the stark realities that make their work essential.
        </p>
      </div>

      {/* Problems Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 border border-gray-200 ${problem.fallbackBg}`}
              style={{ minHeight: '350px' }}
            >
              {/* Background Image */}
              <img 
                src={problem.image} 
                alt={`Child welfare issue ${problem.id}`} 
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              
              {/* Content Overlay - positioned at bottom with minimal background */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white z-10" 
                   style={{
                     background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                   }}>
                {/* Issue Badge */}
                <div className="bg-green-500 bg-opacity-90 rounded-full px-4 py-2 mb-4 inline-block">
                  <span className="text-white font-bold text-sm uppercase tracking-wider">
                    Critical Issue #{problem.id}
                  </span>
                </div>

                {/* Main Statistic */}
                <div className="mb-6">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-600 mb-3">
                    {problem.statistic}
                  </h2>
                  <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                </div>

                {/* Description */}
                <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                  {problem.description}
                </p>

                {/* Bottom accent line */}
                <div className="mt-6 h-1 bg-green-500 rounded-full w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12 sm:mt-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg border border-gray-200">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl text-green-500 font-light mb-6">
            How Aanganwadis Make a Difference
          </h3>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
            Aanganwadis provide essential services including nutritional support, healthcare monitoring, 
            early childhood education, and immunization programs. They serve as the first line of defense 
            against child malnutrition, illiteracy, and preventable diseases in communities across India.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-green-100 rounded-full px-6 py-3 border border-green-300">
              <span className="text-green-700 font-medium">Nutrition Programs</span>
            </div>
            <div className="bg-blue-100 rounded-full px-6 py-3 border border-blue-300">
              <span className="text-blue-700 font-medium">Healthcare Monitoring</span>
            </div>
            <div className="bg-purple-100 rounded-full px-6 py-3 border border-purple-300">
              <span className="text-purple-700 font-medium">Early Education</span>
            </div>
            <div className="bg-yellow-100 rounded-full px-6 py-3 border border-yellow-300">
              <span className="text-yellow-700 font-medium">Immunization Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsSection;