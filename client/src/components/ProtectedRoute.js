import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          dispatch(showLoading());
          const res = await axios.post(
            "http://localhost:8080/api/v1/user/getUserData",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          dispatch(hideLoading());
          if (res.data.success) {
            dispatch(setUser(res.data.data));
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          dispatch(hideLoading());
          localStorage.removeItem("token");
        }
      }
    };
    fetchUser();
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Optionally: Show spinner while loading user data
  // if (!user) return <Spinner />;

  return children;
}
