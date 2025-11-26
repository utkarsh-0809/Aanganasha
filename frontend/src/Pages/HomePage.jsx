import React from 'react'
import HeroSection from '../components/HomePage/HeroSection'
import MedicalServices from '../components/HomePage/MedicalServices'
import HealthcareHeader from '../components/HomePage/HealthcareHeader'
import ProblemsSection from '../components/HomePage/ProblemsSection'
import Footer from '../components/Navbar/Footer'


const HomePage = () => {
  return (
    <div>

<HeroSection/>
<MedicalServices/>
<HealthcareHeader/>
<ProblemsSection/>
<Footer/>

    </div>
  )
}

export default HomePage