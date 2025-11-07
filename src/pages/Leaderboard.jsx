import React from 'react';
import Layout from '../components/common/Layout';
import Leaderboard from '../components/badges/Leaderboard';

const LeaderboardPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <Leaderboard />
      </div>
    </Layout>
  );
};

export default LeaderboardPage;