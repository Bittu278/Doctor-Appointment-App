import React from 'react';
import {useNavigate} from 'react-router-dom';

const DoctorList = ({ doctor }) => {
    const navigate = useNavigate();
  return (
    <>
      <div className='card m-2' style={{cursor:'pointer'}}
        onClick={() =>navigate(`/doctor/book-appointment/${doctor._id}`)}>
        <div className='card-header'>
          Dr. {doctor.firstName} {doctor.lastName}
        </div>
        <div className='card-body'>
          <p>
            <b>Specialization</b> {doctor.specialization}
          </p>
        </div>
        <div className='card-body'>
          <p>
            <b>Experience</b> {doctor.experience}
          </p>
        </div>
        <div className='card-body'>
          <p>
            <b>Fees Per Consultation</b> {doctor.feesPerConsultation}
          </p>
        </div>
        <div className='card-body'>
          <p>
            <b>Timings</b> {doctor.timings && doctor.timings[0]} - {doctor.timings && doctor.timings[1]}
          </p>
        </div>
      </div>
    </>
  );
};

export default DoctorList;
