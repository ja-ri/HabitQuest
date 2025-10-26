import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import levelUpSoundFile from './level-up.mp3';

const HabitQuest = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usersData, setUsersData] = useState({});

  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink Water', xp: 10 },
    { id: 2, name: 'Breakfast', xp: 15 },
    { id: 3, name: 'Exercise', xp: 20 },
    { id: 4, name: 'Relax', xp: 15 },
    { id: 5, name: 'Shower', xp: 20 },
    { id: 6, name: 'Stretch', xp: 25 },
    { id: 7, name: 'Work', xp: 20 },
    { id: 8, name: 'School Work', xp: 30 },
  ]);
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [showStreakBonus, setShowStreakBonus] = useState(null);

  const levelUpSound = new Audio(levelUpSoundFile);
  levelUpSound.volume = 0.4;

  const getToday = () => new Date().toISOString().split('T')[0];

  // Load all users data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('habitQuestData');
    if (savedData) setUsersData(JSON.parse(savedData));
  }, []);

  // Save current user data whenever it changes
  useEffect(() => {
    if (!currentUser) return;
    const allUsersData = { ...usersData };
    allUsersData[currentUser] = { habits, completed, xp, level, streak, lastCompletedDate };
    localStorage.setItem('habitQuestData', JSON.stringify(allUsersData));
    setUsersData(allUsersData);
  }, [habits, completed, xp, level, streak, lastCompletedDate, currentUser]);

  const handleLogin = (username) => {
    setCurrentUser(username);
    const allUsersData = { ...usersData };
    if (allUsersData[username]) {
      const data = allUsersData[username];
      setHabits(data.habits || habits);
      setCompleted(data.completed || []);
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setStreak(data.streak || 0);
      setLastCompletedDate(data.lastCompletedDate || null);
    } else {
      setCompleted([]);
      setXp(0);
      setLevel(1);
      setStreak(0);
      setLastCompletedDate(null);
      allUsersData[username] = { habits, completed: [], xp: 0, level: 1, streak: 0, lastCompletedDate: null };
      localStorage.setItem('habitQuestData', JSON.stringify(allUsersData));
      setUsersData(allUsersData);
    }
    setIsLoggedIn(true);
  };

  const handleComplete = (habit) => {
    if (!completed.includes(habit.id)) {
      setCompleted([...completed, habit.id]);
      setXp((prev) => prev + habit.xp);

      const today = getToday();
      if (lastCompletedDate === today) return;

      if (lastCompletedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(1);
      }
      setLastCompletedDate(today);

      if (streak + 1 === 3) {
        setXp((prev) => prev + 10);
        triggerStreakBonus('🔥 3-Day Streak Bonus! +10 XP');
      }
      if (streak + 1 === 7) {
        setXp((prev) => prev + 50);
        triggerStreakBonus('🔥 7-Day Streak Bonus! +50 XP');
      }
    }
  };

  const triggerStreakBonus = (text) => {
    setShowStreakBonus(text);
    setTimeout(() => setShowStreakBonus(null), 2500);
  };

  useEffect(() => {
    const levelThreshold = level * 100;
    if (xp >= levelThreshold) {
      setLevel((prev) => prev + 1);
      setXp((prev) => prev - levelThreshold);
      setShowLevelUp(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      levelUpSound.play();
      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }, [xp]);

  const progressPercent = Math.min((xp / (level * 100)) * 100, 100);

  // Reset daily completion at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getToday();
      if (lastCompletedDate !== today) {
        setCompleted([]);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastCompletedDate]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-900 to-indigo-900 text-white p-6">
        <h1 className="text-4xl font-bold mb-6">Habit Quest</h1>
        <input 
          type="text" 
          placeholder="Enter your name" 
          className="p-3 rounded-lg mb-4 text-black" 
          onChange={(e) => setCurrentUser(e.target.value)}
          value={currentUser}
        />
        <button 
          onClick={() => handleLogin(currentUser)} 
          className="p-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 to-indigo-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-4">Habit Quest</h1>
      <p className="mb-2 text-lg">User: {currentUser}</p>

      <div className="mb-4 text-center">
        <p className="text-lg">Level {level}</p>
        <p className="text-sm mb-2">XP: {xp} / {level * 100}</p>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-4 bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <p className="mb-4">🔥 Streak: {streak} day{streak !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        {habits.map((habit) => (
          <motion.button
            key={habit.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleComplete(habit)}
            className={`p-4 rounded-2xl font-semibold shadow-md transition-all duration-300 ${
              completed.includes(habit.id)
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 hover:bg-indigo-700'
            }`}
          >
            {habit.name} (+{habit.xp} XP)
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="text-5xl font-extrabold text-yellow-400 drop-shadow-lg">
              🎉 Level Up!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreakBonus && (
          <motion.div
            className="fixed top-1/4 left-1/2 -translate-x-1/2 text-2xl font-bold text-orange-400 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {showStreakBonus}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitQuest;