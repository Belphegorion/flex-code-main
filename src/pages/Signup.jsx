import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import SignupForm from '../components/auth/SignupForm';

const Signup = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
            <SignupForm />
            <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
