export const FLASHCARDS = [
  "Your mind is the most powerful tool you own. Sharpen it daily.",
  "Clarity comes not from thinking more, but from thinking differently.",
  "Every emotion is a message. Learn to listen before you react.",
  "The person you are becoming is built in the moments no one sees.",
  "Growth is not a destination. It is a direction.",
  "Your habits are votes for the person you want to become.",
  "Stillness is not emptiness. It is where your best thinking lives.",
  "The gap between who you are and who you want to be is action.",
  "Overthinking is the enemy of progress. Move, then refine.",
  "Purpose is not found. It is built through intentional living.",
  "Fear is not a stop sign. It is a signal that something matters.",
  "You cannot control outcomes. You can only control your inputs.",
  "Resilience is not about bouncing back. It is about bouncing forward.",
  "Energy flows where attention goes. Guard your focus fiercely.",
  "The most important conversation you have is with yourself.",
  "Discipline is choosing long-term growth over short-term comfort.",
  "You are not your thoughts. You are the one who observes them.",
  "Every setback carries a lesson if you are willing to look.",
  "Authenticity is not a trait. It is a daily practice.",
  "Community amplifies growth. Choose your circle wisely.",
  "Small consistent actions compound into extraordinary results.",
  "The quality of your questions determines the quality of your life.",
  "Emotional balance is not the absence of feeling. It is mastery of response.",
  "Your story is not finished. The best chapters are still being written.",
  "Confidence is not feeling ready. It is deciding to begin anyway.",
  "Mental clarity begins when you stop feeding every distraction.",
  "Boundaries are not walls. They are the architecture of self-respect.",
  "True strength is vulnerability wielded with intention.",
  "You do not rise to the level of your goals. You fall to your systems.",
  "Presence is the rarest and most valuable gift you can offer.",
  "The version of you six months from now is shaped by today.",
  "Rest is not a reward. It is part of the work.",
  "Gratitude reframes scarcity into abundance instantly.",
  "Your potential is not limited by your past. It is defined by your next move.",
  "Aligned action means doing less of the wrong things and more of the right ones.",
];

export const getDailyCard = (createdAt) => {
  const joinDate = new Date(createdAt || Date.now());
  const startOfJoin = new Date(joinDate);
  startOfJoin.setHours(0, 0, 0, 0);

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const daysSinceJoin = Math.floor(
    (startOfToday - startOfJoin) / (24 * 60 * 60 * 1000)
  );

  const seed = startOfToday.getFullYear() * 10000 +
               (startOfToday.getMonth() + 1) * 100 +
               startOfToday.getDate() +
               daysSinceJoin;

  const index = ((seed * 9301 + 49297) % 233280) % FLASHCARDS.length;

  return { card: FLASHCARDS[index], dayNumber: daysSinceJoin + 1 };
};