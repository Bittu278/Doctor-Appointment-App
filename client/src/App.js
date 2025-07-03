import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from './components/Spinner_temp';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ApplyDoctor from './pages/ApplyDoctor';
import NotificationPage from './pages/NotificationPage';
import Doctors from './pages/admin/Doctors';
import Users from './pages/admin/Users';
import UserProfile from './pages/Profile';               // Renamed import
import DoctorProfile from './pages/doctor/DoctorProfile'; // Renamed import
import BookingPage from './pages/BookingPage';
import { setUser } from './redux/features/userSlice';
import axios from 'axios';
import { useEffect } from 'react';
import Appointments from './pages/Appointments';
import DoctorAppointments from './pages/doctor/DoctorAppointments';

function App() {
  const { loading } = useSelector(state => state.alerts);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.post(
            'http://localhost:8080/api/v1/user/getUserData',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.data.success) {
            dispatch(setUser(res.data.data));
          }
        } catch (error) {
          localStorage.clear();
        }
      }
    };
    fetchUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      {loading && <Spinner />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/apply-doctor" element={<ProtectedRoute><ApplyDoctor /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
        {/* Removed /doctor/profile/:id route or create separate component if needed */}
        <Route path="/doctor/book-appointment/:doctorId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/notification" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/doctor-appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
