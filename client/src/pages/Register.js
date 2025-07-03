import { Form, message, Input } from 'antd';
import "../styles/RegisterStyles.css";
import axios from 'axios';
import {useDispatch} from 'react-redux';
import { showLoading,hideLoading } from '../redux/features/alertSlice';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // form handler
  const onfinishHandler = async (values) => {
  try {
    dispatch(showLoading());
    const res = await axios.post('http://localhost:8080/api/v1/user/register', values);
     dispatch(hideLoading());
    if (res.data && res.data.success) {
      message.success('Registered Successfully!');
      navigate('/login');
    } else {
      message.error(res.data?.message || 'Registration failed');
    }
  } catch (error) {
    dispatch(hideLoading());
    console.log(error);
    message.error('Something Went Wrong');
  }
};

  return (
    <div className="form-container">
      <Form layout='vertical'
        onFinish={onfinishHandler}
        className='register-form'
      >
        <h3 className="text-center">Register Form</h3>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password />
        </Form.Item>
        <Link to="/login" className='m-2'>
          Already user? Login here
        </Link>
        <button className='btn btn-primary' type="submit">Register</button>
      </Form>
    </div>
  );
};

export default Register;
