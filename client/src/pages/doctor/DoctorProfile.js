import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import Layout from "../../components/Layout";
import { useSelector } from "react-redux";

const DoctorProfile = () => {
  const { user } = useSelector(state => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.post(
          "http://localhost:8080/api/v1/doctor/getProfile",
          { userId: user._id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        if (res.data.success) setProfile(res.data.data);
      } catch {
        message.error("Failed to load profile");
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/doctor/updateProfile",
        { ...values, userId: user._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      if (res.data.success) {
        setProfile(res.data.data);
        message.success(res.data.message);
      } else {
        message.error("Update failed");
      }
    } catch {
      message.error("Update failed");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <h2>Doctor Profile</h2>
      {profile && (
        <Form
          layout="vertical"
          initialValues={profile}
          onFinish={onFinish}
          style={{ maxWidth: 400 }}
        >
          <Form.Item label="First Name" name="firstName">
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName">
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Specialization" name="specialization">
            <Input />
          </Form.Item>
          <Form.Item label="Experience (years)" name="experience">
            <Input />
          </Form.Item>
          <Form.Item label="Fee Per Consultation" name="feePerCunsaltation">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Form>
      )}
    </Layout>
  );
};

export default DoctorProfile;
