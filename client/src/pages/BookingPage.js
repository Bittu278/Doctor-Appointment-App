import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';

const BookingPage = () => {
  const params = useParams();
  const { user } = useSelector(state => state.user);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [isAvailable,setIsAvailable]=useState(false);
  const dispatch = useDispatch();

  const getDoctorData = async () => {
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/doctor/getDoctorById',
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem('token')
          }
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
//************BOOKING FUNC 
const handlebooking = async () => {
    if (!user || !user._id) {
    alert("User not authenticated. Please log in again.");
    return;
  }
    if (!date || !time) {
      alert("Please select date and time!");
      return;
    }
    try {
      dispatch(showLoading());
      const res = await axios.post(
        'http://localhost:8080/api/v1/user/book-appointment',
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
    );
    dispatch(hideLoading());
      if (res.data.success) {
        alert("Appointment booked successfully!");
      } else {
        alert(res.data.message || "Booking failed!");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      alert("Something went wrong!");
    }
  };

const handleAvailability = async () => {
  if (!date || !time) {
    alert("Please select date and time!");
    return;
  }
  try {
    dispatch(showLoading());
    const res = await axios.post(
      'http://localhost:8080/api/v1/user/booking-availability',
      { doctorId: params.doctorId, date, time },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    dispatch(hideLoading());
    if (res.data.success) {
      setIsAvailable(true);
      alert(res.data.message);
    } else {
      setIsAvailable(false);
      alert(res.data.message);
    }
  } catch (error) {
    dispatch(hideLoading());
    console.log(error);
    alert("Error checking availability");
  }
};


  useEffect(() => {
    getDoctorData();
    //eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <h1>Booking Page</h1>
      {loading && <p>Loading doctor details...</p>}
      {!loading && doctor && (
        <div className="card m-2 p-2">
          <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
          <p><b>Specialization:</b> {doctor.specialization}</p>
          <p><b>Experience:</b> {doctor.experience}</p>
          <p><b>Fees Per Consultation:</b> {doctor.feesPerConsultation}</p>
          <p><b>Timings:</b> {doctor.timings && doctor.timings[0]} - {doctor.timings && doctor.timings[1]}</p>
          <div className="d-flex flex-column w-50">
            <DatePicker
              className='m-2'
              format="DD-MM-YYYY"
              onChange={value => {
                setDate(value ? value.format('DD-MM-YYYY') : null)}}
            />
            <TimePicker
              className='m-2'
              format="HH:mm"
              onChange={value => {
                setTime(value ? value.format("HH:mm") : null)}}
            />
            <button className='btn btn-primary mt-2' onClick={handleAvailability}>
              Check Availability
            </button>
            <button className='btn btn-primary mt-2' onClick={handlebooking} disabled={!isAvailable}>
              Book Now
            </button>
           {date && <p>Selected Date: {date}</p>}
            {time && <p>Selected Time: {time}</p>}
          </div>
        </div>
      )}
      {!loading && !doctor && (
        <p>Doctor not found.</p>
      )}
    </Layout>
  );
};

export default BookingPage;
