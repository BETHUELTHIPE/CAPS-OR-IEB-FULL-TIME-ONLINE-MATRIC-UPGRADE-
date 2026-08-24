export type ToastType = "streak" | "milestone" | "distinction" | "badge" | "info" | "curriculum_milestone";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  streakCount?: number;
  milestoneTitle?: string;
  milestonePercent?: number;
  subjectName?: string;
  rewardText?: string;
  iconType?: "flame" | "trophy" | "award" | "zap" | "star" | "sparkles" | "party";
  actionLabel?: string;
  actionTab?: string;
  duration?: number; // in ms
  createdAt?: number;
}

export const AMH_TOAST_EVENT = "amh_toast_event";

export function showToast(toast: Omit<ToastItem, "id">) {
  const fullToast: ToastItem = {
    ...toast,
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    duration: toast.duration || 6000,
    createdAt: Date.now()
  };

  window.dispatchEvent(
    new CustomEvent<ToastItem>(AMH_TOAST_EVENT, { detail: fullToast })
  );
}

export function triggerStreakToast(streakCount: number, rewardText?: string) {
  let title = `🔥 ${streakCount}-Day Flame Scholar Streak!`;
  let message = `Incredible dedication! You've maintained a ${streakCount}-day continuous math streak.`;
  let reward = rewardText || "+100 XP & Flame Scholar Badge";

  if (streakCount === 7) {
    title = "🔥 7-Day Flame Scholar Streak Reached!";
    message = "Outstanding consistency! 7 days of consecutive CAPS/IEB problem solving unlocked.";
    reward = "CAPS Formula Cheat Sheet Unlocked (+150 XP)";
  } else if (streakCount === 14) {
    title = "⚡ 14-Day Math Champion Milestone!";
    message = "14 days in a row! You are building unstoppable exam momentum.";
    reward = "10% Tutoring Voucher Unlocked";
  } else if (streakCount >= 30) {
    title = "👑 30-Day Matric Legend Milestone!";
    message = "Unbelievable mastery! 30 days of continuous mathematical excellence.";
    reward = "VIP Verified Legend Badge Unlocked";
  }

  showToast({
    type: "streak",
    title,
    message,
    streakCount,
    milestoneTitle: `${streakCount}-Day Streak`,
    rewardText: reward,
    iconType: "flame",
    actionLabel: "View Streak Perks",
    actionTab: "daily_challenge",
    duration: 8000
  });
}

export function triggerMilestoneToast(
  title: string, 
  message: string, 
  options?: {
    rewardText?: string;
    milestoneTitle?: string;
    iconType?: "flame" | "trophy" | "award" | "zap" | "star" | "sparkles";
    actionLabel?: string;
    actionTab?: string;
  }
) {
  showToast({
    type: "milestone",
    title,
    message,
    milestoneTitle: options?.milestoneTitle || "Academic Milestone",
    rewardText: options?.rewardText || "Milestone Badge Earned",
    iconType: options?.iconType || "trophy",
    actionLabel: options?.actionLabel || "View Dashboard",
    actionTab: options?.actionTab || "overview",
    duration: 7000
  });
}

export function triggerDistinctionToast(
  scorePercentage: number, 
  topicName: string, 
  difficulty: string = "Intermediate"
) {
  const isCode7 = scorePercentage >= 80;
  const isPerfect = scorePercentage === 100;

  let title = isPerfect 
    ? "🌟 Perfect 100% Score Achieved!" 
    : isCode7 
    ? "🏆 Code 7 Distinction Unlocked!" 
    : "🎯 Assessment Attempt Completed!";

  let message = `You scored ${scorePercentage}% in ${topicName} at ${difficulty} level!`;
  let reward = isCode7 ? "Level 7 Distinction Badge & +200 XP" : "+50 Knowledge XP";

  showToast({
    type: "distinction",
    title,
    message,
    milestoneTitle: isCode7 ? "Code 7 Distinction" : "Quiz Mastery",
    rewardText: reward,
    iconType: isPerfect ? "sparkles" : isCode7 ? "trophy" : "award",
    actionLabel: "Review Breakdown",
    actionTab: "subject_quiz",
    duration: 7500
  });
}

export function triggerCurriculum10PercentToast(
  subjectName: string,
  milestonePercent: number,
  strandOrTopicName?: string
) {
  const is100 = milestonePercent >= 100;

  const title = is100
    ? `🎉 100% Curriculum Mastered in ${subjectName}!`
    : `🚀 ${milestonePercent}% Milestone Reached in ${subjectName}!`;

  const message = is100
    ? `Flawless achievement! You've officially completed 100% of the ${subjectName} CAPS/IEB curriculum!`
    : `Great progress! You just crossed the ${milestonePercent}% completion threshold in ${strandOrTopicName || subjectName}.`;

  const rewardText = is100
    ? "🏆 Gold Syllabus Master Trophy & +500 XP"
    : `+${milestonePercent * 5} Milestone XP & ${milestonePercent}% Badge`;

  showToast({
    type: "curriculum_milestone",
    title,
    message,
    milestonePercent,
    subjectName,
    milestoneTitle: `${milestonePercent}% Curriculum Milestone`,
    rewardText,
    iconType: "party",
    actionLabel: "View Progress Dashboard",
    actionTab: "learning_progress",
    duration: 10000
  });
}
