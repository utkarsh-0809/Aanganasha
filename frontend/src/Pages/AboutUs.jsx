import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Target, 
  Eye, 
  Award, 
  TrendingUp, 
  Calendar,
  Baby,
  Stethoscope,
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Footer from '../components/Navbar/Footer';

const AboutUs = () => {
  const navigate = useNavigate();

  const impactStats = [
    {
      icon: <Baby className="w-10 h-10 text-green-600" />,
      number: "1,200+",
      label: "Children Registered & Monitored",
      description: "Children under 7 years have been onboarded with detailed health, growth, and nutrition records."
    },
    {
      icon: <Target className="w-10 h-10 text-green-600" />,
      number: "92%+",
      label: "Vaccination Tracking Accuracy",
      description: "Automated alerts ensure that most children receive timely vaccination reminders, reducing missed doses."
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-green-600" />,
      number: "2,000+",
      label: "Growth & Nutrition Reports Generated",
      description: "Digital BMI and nutrition charts help coordinators and doctors identify early signs of malnutrition."
    },
    {
      icon: <Stethoscope className="w-10 h-10 text-green-600" />,
      number: "180+ visits",
      label: "Doctor Consultations Facilitated",
      description: "Volunteer doctors have connected with local Anganwadis for regular health check-ups and awareness sessions."
    },
    {
      icon: <BookOpen className="w-10 h-10 text-green-600" />,
      number: "350+ donations",
      label: "Community Donations Processed",
      description: "Verified contributions of clothes, books, and toys have reached children directly through our platform."
    },
    {
      icon: <Eye className="w-10 h-10 text-green-600" />,
      number: "80% reduction",
      label: "Data Transparency Improvement",
      description: "Coordinators report higher accuracy in child data due to digital records replacing manual registers."
    },
    {
      icon: <Calendar className="w-10 h-10 text-green-600" />,
      number: "20+ Anganwadis",
      label: "Centers Digitally Onboarded",
      description: "Partner centers across rural districts are now operating through a unified, cloud-based system."
    }
  ];

  const coreValues = [
    {
      icon: <Eye className="w-12 h-12 text-green-500" />,
      title: "Transparency",
      description: "Real-time, accurate data tracking for every child with complete visibility into health and development records."
    },
    {
      icon: <Heart className="w-12 h-12 text-green-500" />,
      title: "Compassion",
      description: "Centered on empathy and community upliftment, ensuring every child receives the care they deserve."
    },
    {
      icon: <Users className="w-12 h-12 text-green-500" />,
      title: "Collaboration",
      description: "Doctors, coordinators, and caregivers working together for a shared goal of child welfare."
    },
    {
      icon: <Sparkles className="w-12 h-12 text-green-500" />,
      title: "Innovation",
      description: "Using technology to simplify and strengthen social impact in rural healthcare."
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Sarah Patel",
      role: "Medical Advisory Head",
      image: "/api/placeholder/150/150",
      description: "Pediatrician with 15+ years in rural healthcare"
    },
    {
      name: "Rajesh Kumar",
      role: "Technology Lead",
      image: "/api/placeholder/150/150", 
      description: "Full-stack developer passionate about social impact"
    },
    {
      name: "Priya Sharma",
      role: "Community Relations",
      image: "/api/placeholder/150/150",
      description: "Expert in NGO operations and field coordination"
    },
    {
      name: "Amit Singh",
      role: "Data Analytics",
      image: "/api/placeholder/150/150",
      description: "Specialist in healthcare data and reporting systems"
    }
  ];

  const taglines = [
    "Hope begins with a healthy start.",
    "Digital care for every little heart.",
    "Empowering Anganwadis, nurturing futures.",
    "From data to dreams — every child matters.",
    "Join hands to build brighter beginnings.",
    "Tracking growth, inspiring hope.",
    "Transparency. Care. Change."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            About AnganAsha
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            🌸 About Us – AnganAsha
          </h1>
          
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
            At AnganAsha, we believe that every child deserves a healthy start and a hopeful future. 
            Our platform bridges the gap between rural Anganwadi centers and the digital world by 
            ensuring complete transparency in child health, nutrition, and development records.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={() => navigate('/donate')}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Support Our Mission <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-white border-2 border-green-200 text-green-600 rounded-full font-semibold hover:bg-green-50 transition-all duration-300"
            >
              Get in Touch
            </button>
          </div>

          {/* Rotating Taglines */}
          <div className="text-gray-600 italic">
            <p className="animate-pulse">{taglines[Math.floor(Math.random() * taglines.length)]}</p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6">
                Founded with the vision of empowering communities, AnganAsha provides a unified digital solution 
                to monitor and manage child growth, vaccination schedules, and nutrition data across various Anganwadis. 
                Our goal is to make early childhood care more efficient, transparent, and community-driven.
              </p>
              <p className="mb-6">
                We collaborate with Anganwadi workers, coordinators, and medical professionals to create an ecosystem 
                where children below the age of 7 receive continuous attention to their health and well-being. The platform 
                ensures that each child's vaccination and growth records are securely stored and accessible to authorized 
                personnel—promoting accountability and care at every level.
              </p>
              <p>
                In addition, our Donation Module allows people to contribute directly to the welfare of children and centers 
                by donating books, clothes, toys, or funds. Every donation is mapped to verified centers, ensuring that help 
                reaches where it is truly needed. Through technology and compassion, we aim to build a transparent and 
                nurturing environment that uplifts rural childhood development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-100 to-emerald-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">🌱 Our Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To revolutionize the functioning of Anganwadis by digitizing data management, 
                fostering community support, and promoting accountability in child care and development.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">🌻 Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                A future where every child—irrespective of their background—receives the care, nutrition, 
                and opportunities needed for a healthy, happy, and educated life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Measuring the difference we are making together</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</h3>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</h4>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-100 to-emerald-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">💠 Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Passionate individuals working towards a common goal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
                <div className="w-24 h-24 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h3>
                <h4 className="text-sm font-semibold text-green-600 mb-3">{member.role}</h4>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8 leading-relaxed">
            Together, we can ensure every child gets the healthy start they deserve. 
            Whether through donations, volunteering, or spreading awareness—every contribution matters.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/donate')}
              className="px-8 py-3 bg-white text-green-600 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Make a Donation
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Volunteer With Us
            </button>
          </div>

          <div className="mt-8 text-lg italic opacity-90">
            "Transparency. Care. Change."
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;