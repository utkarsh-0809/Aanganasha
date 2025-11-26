import React from 'react'
import AppointmentNoti from '../components/Noti/AppointmentNoti'
import VaccinationNoti from '../components/Noti/VaccinationNoti'
const Noti = () => {
  return (
    <div>


<div className="flex justify-center items-center min-h-screen bg-green-100">
      <AppointmentNoti 
        student="John Doe" 
        doctor="Smith" 
        date="March 30, 2025" 
        time="10:00 AM" 
      />
    </div>


    <div className="flex justify-center items-center min-h-screen bg-green-100">
      <VaccinationNoti
        notification={{
          student: "John Doe",
          vaccineName: "COVID-19",
          dateAdministered: "April 5, 2025",
          status: "Completed"
        }}
      />
    </div>
    </div>
  )
}

export default Noti