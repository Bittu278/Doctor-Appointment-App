import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Table, message } from "antd";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Fetch users
  const getUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Error fetching users");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Block/Unblock handler
  const handleBlockUnblockUser = async (userId, block) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/admin/blockUnblockUser",
        { userId, block },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getUsers();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error("Failed to update user status");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>{record.name || (record.firstName && record.lastName ? record.firstName + " " + record.lastName : "")}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Doctor",
      dataIndex: "isDoctor",
      render: (text, record) => <span>{record.isDoctor ? "Yes" : "No"}</span>,
    },
    {
      title: "Blocked",
      dataIndex: "isBlocked",
      render: (text, record) => <span>{record.isBlocked ? "Yes" : "No"}</span>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.isBlocked ? (
            <button
              className="btn btn-success"
              onClick={() => handleBlockUnblockUser(record._id, false)}
            >
              Unblock
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => handleBlockUnblockUser(record._id, true)}
            >
              Block
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-2">Users List</h1>
      <Table columns={columns} dataSource={users} rowKey="_id" />
    </Layout>
  );
};

export default Users;
