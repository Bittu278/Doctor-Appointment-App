import Layout from '../components/Layout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'
import { Table } from 'antd'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const getAppointments = async () => {
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/user/user-appointments',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      if (res.data.success) {
        setAppointments(res.data.data)
      } else {
        alert(res.data.message || "Booking failed!")
      }
    } catch (error) {
      alert("Error fetching appointments")
    }
  }
  useEffect(() => {
    getAppointments()
  }, [])

  // Use [] for columns, and reference doctorInfo
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
    },
    {
      title: 'Name',
      dataIndex: 'doctorInfo',
      render: (text, record) => (
        <span>
          {record.doctorInfo?.firstName} {record.doctorInfo?.lastName}
        </span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'doctorInfo',
      render: (text, record) => (
        <span>
          {record.doctorInfo?.phone}
        </span>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'date',
      render: (text, record) => (
        <span>
          {moment(record.date).format('DD-MM-YYYY')} &nbsp;
          {record.time}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
  ]

  return (
    <Layout>
      <h1>Appointments</h1>
      <Table columns={columns} dataSource={appointments} rowKey="_id" />
    </Layout>
  )
}

export default Appointments
