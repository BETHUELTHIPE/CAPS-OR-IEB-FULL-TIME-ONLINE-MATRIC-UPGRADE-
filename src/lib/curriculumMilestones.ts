import { triggerCurriculum10PercentToast } from "./toast";

export const MILESTONE_STORAGE_KEY = "amh_curriculum_10pct_milestones";

export interface CurriculumMilestoneRecord {
  [subjectOrTopicKey: string]: number; // e.g. "Algebra": 80, "Trigonometry": 60, "Mathematics Paper 1": 70
}

/**
 * Retrieves stored milestone percentages for subjects & topics.
 */
export function getStoredCurriculumMilestones(): CurriculumMilestoneRecord {
  try {
    const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Error reading curriculum milestone storage:", e);
    return {};
  }
}

/**
 * Evaluates progress percentage for a subject or strand.
 * If a new 10% boundary is crossed (e.g. 10%, 20%, 30%, ... 100%),
 * updates stored milestones and triggers a celebratory toast notification and animation event.
 *
 * @param subjectOrTopic - Subject or topic name (e.g., "Mathematics Paper 1", "Trigonometry", "Calculus")
 * @param currentPercent - Current completion percentage (0 to 100)
 * @param detailLabel - Optional descriptive sub-label
 * @param forceTrigger - If true, bypasses previous check for testing/demonstration
 */
export function evaluateCurriculumMilestone(
  subjectOrTopic: string,
  currentPercent: number,
  detailLabel?: string,
  forceTrigger: boolean = false
): boolean {
  if (currentPercent <= 0 && !forceTrigger) return false;

  const validPercent = Math.min(100, Math.max(0, currentPercent));
  const current10PercentMilestone = Math.floor(validPercent / 10) * 10;

  if (current10PercentMilestone <= 0 && !forceTrigger) return false;

  const stored = getStoredCurriculumMilestones();
  const previousMilestone = stored[subjectOrTopic] || 0;

  const isNewMilestone = current10PercentMilestone > previousMilestone;

  if (isNewMilestone || forceTrigger) {
    const milestoneToReport = forceTrigger ? (current10PercentMilestone || 10) : current10PercentMilestone;
    stored[subjectOrTopic] = milestoneToReport;
    try {
      localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.error("Error writing curriculum milestone storage:", e);
    }

    // Trigger celebratory toast notification
    triggerCurriculum10PercentToast(subjectOrTopic, milestoneToReport, detailLabel);

    // Dispatch global celebration burst event for dashboard animation components
    window.dispatchEvent(
      new CustomEvent("amh_celebration_burst", {
        detail: {
          subject: subjectOrTopic,
          milestonePercent: milestoneToReport,
          timestamp: Date.now()
        }
      })
    );

    return true;
  }

  return false;
}

/**
 * Reset stored milestones (useful for testing or profile reset)
 */
export function resetCurriculumMilestones(): void {
  try {
    localStorage.removeItem(MILESTONE_STORAGE_KEY);
  } catch (e) {
    console.error("Error resetting curriculum milestone storage:", e);
  }
}
