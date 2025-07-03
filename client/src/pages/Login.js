import { Form, message, Input } from 'antd';
import "../styles/RegisterStyles.css";
import axios from 'axios';
import {useDispatch} from 'react-redux';
import { showLoading,hideLoading } from '../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';
import { setUser } from "../redux/features/userSlice"; 

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // form handler
  const onfinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post('http://localhost:8080/api/v1/user/login', values);
      dispatch(hideLoading());
      if (res.data && res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success('Login Successfully!');
        // Fetch user data right after login
      const userRes = await axios.post(
        "http://localhost:8080/api/v1/user/getUserData",
        {},
        {
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        }
      );
      if (userRes.data.success) {
        dispatch(setUser(userRes.data.data)); // Update Redux state
      }
      navigate('/');
      } else {
        message.error(res.data?.message || 'Login failed');
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  return (
    <div className="form-container">
      <Form
        layout='vertical'
        onFinish={onfinishHandler}
        className='register-form'
      >
        <h3 className="text-center">Login Form</h3>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter your email' }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password />
        </Form.Item>
        <Link to="/register" className='m-2'>
          Not a user? Register here
        </Link>
        <button className='btn btn-primary' type="submit">
          Login
        </button>
      </Form>
    </div>
  );
};

export default Login;
