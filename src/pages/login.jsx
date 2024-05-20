/*global google*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jwtDecode from 'jwt-decode';
import Header from '../components/header';
import Footer from '../components/footer';

const Login = ({ history }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleCallbackResponse = async (response) => {
    try {
      const userObject = jwtDecode(response.credential);
      setFormData(userObject);
      const token = response.credential;

      console.log('Decoded User Object:', userObject);

      const { data } = await axios.post('https://cotmemo.onrender.com/api/login', {
        email: userObject.email,
        token: token,
      });

      if (data.success) {
        const response = await fetch('https://cotmemo.onrender.com/api/getme', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });

        if (response.status === 200 && response.ok) {
          const result = await response.json();
          const role = result.user.role;

          setFormData({});
          toast.success('Login successfully!');

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.token);
          }

          switch (role) {
            case 1:
            case '1':
              history.push('/admin/dashboard');
              break;
            case 2:
            case '2':
              history.push('/secretary/dashboard');
              break;
            case 3:
            case '3':
              history.push('/user/dashboard');
              break;
            case 0:
            case '0':
              history.push('/Unregisteruser/dashboard');
              break;
            default:
              toast.error('Unknown user role');
              break;
          }
        } else {
          toast.error('Login failed. Please check your credentials.');
        }
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      toast.error(err.response?.data?.error || 'An error occurred.');
    }
  };

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: '373547344231-6j6o6t1hnnpke6j59nj9g2l51hgk5nup.apps.googleusercontent.com', // Replace with your actual client ID
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById('signin'),
      { theme: 'outline', size: 'large' }
    );
  }, []);

  return (
    <div>
      <Header />
      <div className="container">
        <div className="register">
          <h2>Login</h2>
          <div id="signin">Sign In with Google</div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Login;
