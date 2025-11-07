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
      <div className="min-h-screen landing-page">
        {/* Hero Section (modern framed hero) */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hero-banner p-6">
              <div className="hero-inner">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="inline-block px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium">🚀 Trusted by 10,000+ Event Professionals</div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">BUSINESS EXPERTISE WITH PERSPECTIVE</h1>
                  <p className="text-lg text-gray-300 max-w-xl">Connect with top talent or discover your next opportunity. Built for success with secure payments and real-time collaboration.</p>
                  <div className="mt-4 flex gap-4">
                    <Link to="/signup" className="hero-cta">Get Started</Link>
                    <Link to="/jobs" className="btn-ghost">Browse Jobs</Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-center"
                >
                  <div className="rounded-image-frame w-80 h-56 flex items-center justify-center">
                    {/* Decorative gradient placeholder (was an invalid image reference) */}
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700" aria-hidden="true" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
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
                  <stat.icon className="mx-auto text-primary-600 dark:text-primary-400 mb-2" size={32} />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Why Choose FlexCode?</h2>
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
                  className="card text-center p-6 hover:shadow-xl transition-all"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
                    <feature.icon className="text-primary-600 dark:text-primary-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">See what our community has to say</p>
              </motion.div>

              <div className="relative max-w-4xl mx-auto">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="card p-8 md:p-12"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                      {reviews[currentReview].avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{reviews[currentReview].name}</h4>
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
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentReview 
                          ? 'bg-primary-600 w-8' 
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary-400'
                      }`}
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
              className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white p-12 text-center"
            >
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-primary-100">Join thousands of professionals and organizers today</p>
              <Link 
                to="/signup" 
                className="inline-block bg-white text-primary-600 px-10 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
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
