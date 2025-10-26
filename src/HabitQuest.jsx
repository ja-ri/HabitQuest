import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import levelUpSoundFile from "./level-up.mp3";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const HabitQuest = () => {
  const [currentUser, setCurrentUser] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showStreakBonus, setShowStreakBonus] = useState(null);

  const levelUpSound = new Audio(levelUpSoundFile);
  levelUpSound.volume = 0.4;

  const getToday = () => new Date().toISOString().split("T")[0];

  // Login function: fetch user data from Firestore
  const handleLogin = async (username) => {
    if (!username) return;
    setCurrentUser(username);

    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      setCompleted(data.completed || []);
      setXp(data.xp || 0);
      setLevel(data.level || 1);
      setStreak(data.streak || 0);
      setLastCompletedDate(data.lastCompletedDate || null);
    } else {
      await setDoc(userRef, {
        habits,
        completed: [],
        xp: 0,
        level: 1,
        streak: 0,
        lastCompletedDate: null,
      });
      setCompleted([]);
      setXp(0);
      setLevel(1);
      setStreak(0);
      setLastCompletedDate(null);
    }

    setIsLoggedIn(true);
  };

  // Habit completion handler
  const handleComplete = async (habit) => {
    if (completed.includes(habit.id)) return;

    const today = getToday();
    const newCompleted = [...completed, habit.id];
    let newXp = xp + habit.xp;
    let newStreak = streak;

    if (lastCompletedDate === new Date(Date.now() - 86400000).toISOString().split("T")[0]) {
      newStreak += 1;
    } else if (lastCompletedDate !== today) {
      newStreak = 1;
    }

    setCompleted(newCompleted);
    setXp(newXp);
    setStreak(newStreak);
    setLastCompletedDate(today);

    // Streak bonuses
    if (newStreak === 3) { newXp += 10; triggerStreakBonus("🔥 3-Day Streak Bonus! +10 XP"); }
    if (newStreak === 7) { newXp += 50; triggerStreakBonus("🔥 7-Day Streak Bonus! +50 XP"); }

    // Save progress to Firestore
    const userRef = doc(db, "users", currentUser);
    await setDoc(userRef, {
      habits,
      completed: newCompleted,
      xp: newXp,
      level,
      streak: newStreak,
      lastCompletedDate: today,
    }, { merge: true });
  };

  const triggerStreakBonus = (text) => {
    setShowStreakBonus(text);
    setTimeout(() => setShowStreakBonus(null), 2500);
  };

  // Level up effect
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-6">Habit Quest</h1>
        <input
          type="text"
          placeholder="Enter your name"
          className="p-3 rounded-lg mb-4 text-black border border-gray-300"
          onChange={(e) => setCurrentUser(e.target.value)}
          value={currentUser}
        />
        <button
          onClick={() => handleLogin(currentUser)}
          className="p-3 bg-green-400 text-black rounded-lg font-semibold hover:bg-green-300"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-4">Habit Quest</h1>
      <p className="mb-2 text-lg">User: {currentUser}</p>

      <div className="mb-4 text-center">
        <p className="text-lg">Level {level}</p>
        <p className="text-sm mb-2">XP: {xp} / {level * 100}</p>
        <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden">
          <motion.div
            className="h-4 bg-green-400"
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
                ? "bg-green-400 text-black"
                : "bg-gray-200 text-black hover:bg-gray-300"
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
            <motion.div className="text-5xl font-extrabold text-yellow-600 drop-shadow-lg">
              🎉 Level Up!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreakBonus && (
          <motion.div
            className="fixed bottom-10 text-lg font-bold text-red-600"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
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
