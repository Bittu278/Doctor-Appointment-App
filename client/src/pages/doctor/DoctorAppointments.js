import Layout from '../../components/Layout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import { Table } from 'antd'
import { useSelector } from 'react-redux'

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const { user } = useSelector(state => state.user);
  const [loadingId, setLoadingId] = useState(null);

  // Fetch the doctor's _id using the user's _id
  useEffect(() => {
    const fetchDoctorId = async () => {
      if (user && user._id) {
        const res = await axios.post(
          'http://localhost:8080/api/v1/doctor/getDoctorInfo',
          { userId: user._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (res.data.success) {
          setDoctorId(res.data.data._id); // set the doctor's _id
        }
      }
    };
    fetchDoctorId();
  }, [user]);

  // Fetch appointments using the doctor's _id
  useEffect(() => {
    const getAppointments = async () => {
      if (!doctorId) return;
      try {
        const res = await axios.post(
          'http://localhost:8080/api/v1/doctor/doctor-appointments',
          { doctorId: doctorId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (res.data.success) {
          setAppointments(res.data.data);
        } else {
          alert(res.data.message || "Booking failed!");
        }
      } catch (error) {
        alert("Error fetching appointments");
      }
    };
    getAppointments();
  }, [doctorId]);

  // Optimistic UI update for status change
  const handleStatus = async (record, status) => {
    setLoadingId(record._id);

    // Optimistically update UI
    setAppointments(prev =>
      prev.map(app =>
        app._id === record._id ? { ...app, status } : app
      )
    );

    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/doctor/update-appointment-status',
        {
          appointmentId: record._id,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (res.data.success) {
        // Already updated optimistically
      } else {
        // Revert if failed
        setAppointments(prev =>
          prev.map(app =>
            app._id === record._id ? { ...app, status: 'pending' } : app
          )
        );
        alert(res.data.message || "Could not update status!");
      }
    } catch (error) {
      // Revert if error
      setAppointments(prev =>
        prev.map(app =>
          app._id === record._id ? { ...app, status: 'pending' } : app
        )
      );
      alert("Error updating status");
    }
    setLoadingId(null);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
    },
    {
      title: 'Patient Name',
      dataIndex: 'userInfo',
      render: (text, record) => (
        <span>
          {record.userInfo?.name}
        </span>
      ),
    },
    {
      title: 'Patient Phone',
      dataIndex: 'userInfo',
      render: (text, record) => (
        <span>
          {record.userInfo?.phone}
        </span>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'date',
      render: (text, record) => (
        <span>
          {moment(record.date).format('DD-MM-YYYY')} &nbsp;
          {moment(record.time).format('hh:mm A')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: 200,
      render: (text, record) => (
        <div className='d-flex'>
          {record.status === 'pending' && (
            <div className='d-flex'>
              <button
                className='btn btn-success'
                onClick={() => handleStatus(record, 'approved')}
                disabled={loadingId === record._id}
              >
                {loadingId === record._id ? "Approving..." : "Approve"}
              </button>
              <button
                className='btn btn-danger ms-2'
                onClick={() => handleStatus(record, 'rejected')}
                disabled={loadingId === record._id}
              >
                {loadingId === record._id ? "Rejecting..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <Layout>
      <h1>Doctor Appointments</h1>
      <Table columns={columns} dataSource={appointments} rowKey="_id" />
    </Layout>
  );
}

export default DoctorAppointments;
