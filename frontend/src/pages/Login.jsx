import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LoginForm from '../components/auth/LoginForm';
import { FiLogIn } from 'react-icons/fi';

const Login = () => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                <FiLogIn className="text-primary-600 dark:text-primary-400" size={28} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
            </div>
            <LoginForm />
            <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
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
