import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import Layout from "../components/Layout";
import { useSelector } from "react-redux";

const Profile = () => {
  const { user } = useSelector(state => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.post(
          "http://localhost:8080/api/v1/user/getProfile",
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

  // Update profile
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/user/updateProfile",
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
      <h2>User Profile</h2>
      {profile && (
        <Form
          layout="vertical"
          initialValues={profile}
          onFinish={onFinish}
          style={{ maxWidth: 400 }}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
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

export default Profile;
