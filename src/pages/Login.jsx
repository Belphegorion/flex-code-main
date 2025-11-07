import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
            <LoginForm />
            <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
