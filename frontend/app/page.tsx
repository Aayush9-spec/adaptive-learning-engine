'use client';

import { useState, useEffect } from 'react';
import DotGrid from './components/DotGrid';

const API_BASE = 'http://localhost:8000';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [username, setUsername] = useState('student1');
  const [password, setPassword] = useState('password1');
  const [studentName, setStudentName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState({ totalAttempts: 0, accuracy: 0, avgMastery: 0 });
  const [nextRec, setNextRec] = useState<any>(null);
  const [topRecs, setTopRecs] = useState<any[]>([]);
  const [masteryScores, setMasteryScores] = useState<any[]>([]);

  const login = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      setToken(data.access_token);

      const userResponse = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });

      const userData = await userResponse.json();
      setStudentId(userData.student_profile?.id);
      setStudentName(username);
      setIsLoggedIn(true);
      setLoginError('');
    } catch (error) {
      setLoginError('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    setToken(null);
    setStudentId(null);
    setIsLoggedIn(false);
    setStudentName('');
  };

  useEffect(() => {
    if (isLoggedIn && token && studentId) {
      loadDashboard();
    }
  }, [isLoggedIn, token, studentId]);

  const loadDashboard = async () => {
    if (!token || !studentId) return;

    try {
      // Load stats
      const attemptsRes = await fetch(`${API_BASE}/api/attempts/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attempts = await attemptsRes.json();
      const correct = attempts.filter((a: any) => a.is_correct).length;
      const accuracy = attempts.length > 0 ? (correct / attempts.length * 100).toFixed(1) : '0';

      const masteryRes = await fetch(`${API_BASE}/api/mastery/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const masteryData = await masteryRes.json();
      const avgMastery = masteryData.length > 0
        ? (masteryData.reduce((sum: number, m: any) => sum + m.mastery_score, 0) / masteryData.length).toFixed(1)
        : '0';

      setStats({
        totalAttempts: attempts.length,
        accuracy: parseFloat(accuracy),
        avgMastery: parseFloat(avgMastery)
      });
      setMasteryScores(masteryData.slice(0, 10));

      // Load recommendations
      const nextRes = await fetch(`${API_BASE}/api/recommendations/next/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const nextData = await nextRes.json();
      setNextRec(nextData);

      const topRes = await fetch(`${API_BASE}/api/recommendations/top/${studentId}?n=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const topData = await topRes.json();
      setTopRecs(topData.recommendations || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-8 relative">
        <DotGrid />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl font-bold text-white text-center mb-12">
            🎓 Adaptive Learning Engine
          </h1>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Login</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username (e.g., student1)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={login}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Login
              </button>
              <p className="text-center text-gray-600 text-sm mt-4">
                Try: student1-student5 (password: password1-password5)
              </p>
              {loginError && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                  {loginError}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-8 relative">
      <DotGrid />
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold text-white text-center mb-12">
          🎓 Adaptive Learning Engine
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {studentName}!</h2>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600">{stats.totalAttempts}</div>
              <div className="text-gray-600 mt-2">Total Attempts</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600">{stats.accuracy}%</div>
              <div className="text-gray-600 mt-2">Accuracy</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600">{stats.avgMastery}%</div>
              <div className="text-gray-600 mt-2">Avg Mastery</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6">📚 What to Study Next</h2>
          {nextRec && nextRec.topic_name && (
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-600">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">{nextRec.topic_name}</h3>
              <span className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Priority: {nextRec.priority_score?.toFixed(1)}
              </span>
              <p className="mt-4"><strong>Expected Marks Gain:</strong> {nextRec.expected_marks_gain?.toFixed(1)}</p>
              <p><strong>Study Time:</strong> {nextRec.estimated_hours} hours</p>
            </div>
          )}
          {nextRec && nextRec.message && (
            <p className="text-gray-600">{nextRec.message}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-6">🎯 Top 5 Recommendations</h2>
          <div className="space-y-4">
            {topRecs.map((rec, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-lg font-semibold">{index + 1}. {rec.topic_name}</h3>
                <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold mt-2">
                  Priority: {rec.priority_score?.toFixed(1)}
                </span>
                <p className="text-sm text-gray-600 mt-2">
                  Current Mastery: {rec.current_mastery?.toFixed(1)}% |
                  Exam Weight: {rec.exam_weightage}% |
                  Study Time: {rec.estimated_hours}h
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">📊 Your Mastery Scores</h2>
          {masteryScores.length === 0 ? (
            <p className="text-gray-600">No mastery data yet. Start solving questions!</p>
          ) : (
            <div className="space-y-4">
              {masteryScores.map((m, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Concept {m.concept_id}</span>
                    <span>{m.mastery_score?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-purple-900 h-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${m.mastery_score}%` }}
                    >
                      {m.total_attempts} attempts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
