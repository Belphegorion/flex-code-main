import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { FiBriefcase, FiUsers, FiTrendingUp, FiStar, FiCheckCircle, FiDollarSign, FiClock, FiShield, FiZap } from 'react-icons/fi';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    fetch('/reviews.json')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      const timer = setInterval(() => {
        setCurrentReview(prev => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [reviews]);

  const stats = [
    { label: 'Active Jobs', value: '2,500+', icon: FiBriefcase },
    { label: 'Professionals', value: '10,000+', icon: FiUsers },
    { label: 'Success Rate', value: '98%', icon: FiCheckCircle },
    { label: 'Paid Out', value: '$2M+', icon: FiDollarSign }
  ];

  const features = [
    { icon: FiZap, title: 'ML-Powered Matching', desc: 'Smart algorithm matches jobs with 6 weighted factors' },
    { icon: FiShield, title: 'Secure Escrow', desc: 'Stripe-powered payments held until job completion' },
    { icon: FiClock, title: 'Real-Time Chat', desc: 'Instant communication between organizers and workers' },
    { icon: FiStar, title: 'Reputation System', desc: 'Build trust with reliability scores and reviews' }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  🚀 Trusted by 10,000+ Event Professionals
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  BUSINESS EXPERTISE WITH PERSPECTIVE
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                  Connect with top talent or discover your next opportunity. Built for success with secure payments and real-time collaboration.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link 
                    to="/signup" 
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/jobs" 
                    className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg font-semibold hover:border-indigo-600 dark:hover:border-indigo-500 transition-all"
                  >
                    Browse Jobs
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl">
                    <div className="w-full h-64 md:h-80 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                      <div className="text-center text-white">
                        <FiBriefcase size={64} className="mx-auto mb-4 opacity-90" />
                        <p className="text-xl font-semibold">Find Your Perfect Match</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="mx-auto text-indigo-600 dark:text-indigo-400 mb-2" size={32} />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose FlexCode?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Everything you need for successful event staffing</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-center border border-gray-100 dark:border-gray-700"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
                    <feature.icon className="text-indigo-600 dark:text-indigo-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Loved by Thousands</h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">See what our community has to say</p>
              </motion.div>

              <div className="relative max-w-4xl mx-auto">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4 shadow-lg">
                      {reviews[currentReview].avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{reviews[currentReview].name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{reviews[currentReview].role} • {reviews[currentReview].company}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(reviews[currentReview].rating)].map((_, i) => (
                        <FiStar key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                      ))}
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{reviews[currentReview].review}"
                  </p>
                </motion.div>

                <div className="flex justify-center gap-2 mt-6">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentReview(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentReview 
                          ? 'bg-indigo-600 w-8' 
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-indigo-400 w-2'
                      }`}
                      aria-label={`Go to review ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 rounded-2xl text-center shadow-2xl"
            >
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-indigo-100">Join thousands of professionals and organizers today</p>
              <Link 
                to="/signup" 
                className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                Create Free Account
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;