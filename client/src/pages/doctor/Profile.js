import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Form, message, Row, Col, Input, InputNumber, Button, TimePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import dayjs from "dayjs";

const Profile = () => {
  const { user } = useSelector(state => state.user);
  const [doctor, setDoctor] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // handle form submit
  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      setLoading(true);
      // Format timings into array
      const timingsArray = [
        values.startTime.format('h:mm A'),
        values.endTime.format('h:mm A')
      ];
      const doctorData = {
        ...values,
        userId: user._id,
        timings: timingsArray,
        feesPerConsultation: Number(values.feesPerConsultation)
      };
      const res = await axios.post(
        'http://localhost:8080/api/v1/doctor/updateprofile',
        doctorData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      dispatch(hideLoading());
      setLoading(false);
      if (res.data.success) {
        message.success('Profile updated successfully!');
        navigate('/');
      } else {
        message.error(res.data.message || 'Update failed');
      }
    } catch (error) {
      dispatch(hideLoading());
      setLoading(false);
      console.error(error);
      message.error('Something went wrong');
    }
  };

  // get doctor details
  const getDoctorInfo = async () => {
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/doctor/getDoctorInfo',
        { userId: params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (res.data.success) {
        const doc = res.data.data;
        if (doc.timings && doc.timings.length === 2) {
          doc.startTime = dayjs(doc.timings[0], "h:mm A");
          doc.endTime = dayjs(doc.timings[1], "h:mm A");
        }
        setDoctor(doc);
        form.setFieldsValue(doc);
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to load doctor profile");
    }
  };

  useEffect(() => {
    getDoctorInfo();
    //eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <h1>Manage Profile</h1>
      {doctor && (
        <Form form={form} layout='vertical' onFinish={handleFinish} className='m-3'>
          {/* ... your form fields as before ... */}
          {/* Personal Details */}
          <h4 className='mt-4'>Personal Details:</h4>
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                label="First Name" 
                name="firstName" 
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder='Your first name' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                label="Last Name" 
                name="lastName" 
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder='Your last name' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                label="Phone" 
                name="phone" 
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input type='tel' placeholder='Your phone number' />
              </Form.Item>
            </Col>
          </Row>
          {/* Professional Details */}
          <h4 className='mt-4'>Professional Details:</h4>
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                label="Email" 
                name="email" 
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Invalid email format' }
                ]}
              >
                <Input type='email' placeholder='Your professional email' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item label="Website" name="website">
                <Input placeholder='Your website URL' />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item 
                label="Specialization" 
                name="specialization" 
                rules={[{ required: true, message: 'Please enter specialization' }]}
              >
                <Input placeholder='Your medical specialization' />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                label="Experience (Years)" 
                name="experience" 
                rules={[{ required: true, message: 'Please enter experience' }]}
              >
                <InputNumber 
                  min={0} 
                  max={50} 
                  style={{ width: '100%' }} 
                  placeholder='Years of experience' 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item 
                label="Consultation Fee (₹)" 
                name="feesPerConsultation" 
                rules={[{ required: true, message: 'Please enter fee' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder='Fee per consultation' 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={24} lg={8}>
              <Form.Item 
                label="Clinic Address" 
                name="address" 
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input.TextArea placeholder='Full clinic address' />
              </Form.Item>
            </Col>
          </Row>
          {/* Timings */}
          <h4 className='mt-4'>Working Hours:</h4>
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <TimePicker
                  format="h:mm A"
                  placeholder="Select start time"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="End Time"
                name="endTime"
                rules={[{ required: true, message: 'Please select end time' }]}
              >
                <TimePicker
                  format="h:mm A"
                  placeholder="Select end time"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          {/* Update Button */}
          <div className='d-flex justify-content-center'>
            <Button
              type="primary"
              htmlType="submit"
              className='form-btn'
              loading={loading}
              style={{ fontSize: '24px' }}
            >
              Update
            </Button>
          </div>
        </Form>
      )}
    </Layout>
  )
}

export default Profile;
