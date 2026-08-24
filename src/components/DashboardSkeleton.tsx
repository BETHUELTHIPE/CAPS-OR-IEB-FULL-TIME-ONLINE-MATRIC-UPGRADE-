import React from "react";
import { motion } from "motion/react";

/**
 * Single skeleton element with pulsing animation and optional custom dimensions
 */
export const SkeletonPulse: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "h-4 w-full bg-slate-200 dark:bg-navy-800 rounded-md", style }) => {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={style}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    />
  );
};

/**
 * Standard Card Skeleton for Dashboard widgets
 */
export const CardSkeleton: React.FC<{
  title?: boolean;
  lines?: number;
  height?: string;
  className?: string;
}> = ({ title = true, lines = 3, height = "auto", className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4 ${className}`}
      style={{ minHeight: height }}
    >
      {/* Header Skeleton */}
      {title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-9 h-9 rounded-xl bg-royal-100 dark:bg-navy-800" />
            <div className="space-y-1.5">
              <SkeletonPulse className="h-4 w-32 bg-slate-200 dark:bg-navy-700" />
              <SkeletonPulse className="h-3 w-20 bg-slate-100 dark:bg-navy-800" />
            </div>
          </div>
          <SkeletonPulse className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-navy-800" />
        </div>
      )}

      {/* Body Lines Skeleton */}
      <div className="space-y-2.5 pt-1">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonPulse
            key={i}
            className={`h-3.5 bg-slate-200 dark:bg-navy-800 rounded ${
              i === lines - 1 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>

      {/* Footer Pill Skeleton */}
      <div className="pt-2 flex items-center justify-between">
        <SkeletonPulse className="h-6 w-24 rounded-full bg-slate-100 dark:bg-navy-800" />
        <SkeletonPulse className="h-4 w-16 rounded bg-slate-100 dark:bg-navy-800" />
      </div>
    </motion.div>
  );
};

/**
 * Metric KPI Tile Skeleton
 */
export const MetricTileSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center justify-between"
    >
      <div className="space-y-2">
        <SkeletonPulse className="h-3.5 w-24 bg-slate-200 dark:bg-navy-700" />
        <SkeletonPulse className="h-7 w-20 bg-royal-200 dark:bg-navy-600 rounded-lg" />
        <SkeletonPulse className="h-3 w-32 bg-slate-100 dark:bg-navy-800" />
      </div>
      <SkeletonPulse className="w-12 h-12 rounded-2xl bg-royal-100 dark:bg-navy-800" />
    </motion.div>
  );
};

/**
 * Chart Skeleton for Recharts widgets
 */
export const ChartCardSkeleton: React.FC<{ title?: string }> = ({ title = "Performance Trend" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="w-9 h-9 rounded-xl bg-gold-100 dark:bg-navy-800" />
          <div className="space-y-1">
            <SkeletonPulse className="h-4 w-40 bg-slate-200 dark:bg-navy-700" />
            <SkeletonPulse className="h-3 w-24 bg-slate-100 dark:bg-navy-800" />
          </div>
        </div>
        <div className="flex gap-2">
          <SkeletonPulse className="h-7 w-16 rounded-lg bg-slate-100 dark:bg-navy-800" />
          <SkeletonPulse className="h-7 w-16 rounded-lg bg-slate-100 dark:bg-navy-800" />
        </div>
      </div>

      {/* Simulated Chart Bars / Lines */}
      <div className="pt-4 h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-100 dark:border-navy-800">
        {[40, 65, 55, 80, 70, 90, 85, 95].map((heightPct, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              className="w-full bg-slate-200 dark:bg-navy-800 rounded-t-md"
              style={{ height: `${heightPct}%` }}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: idx * 0.1 }}
            />
            <SkeletonPulse className="h-2.5 w-6 bg-slate-100 dark:bg-navy-800" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Learning Progress Card Skeleton
 */
export const LearningProgressSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="w-10 h-10 rounded-xl bg-royal-100 dark:bg-navy-800" />
          <div className="space-y-1.5">
            <SkeletonPulse className="h-5 w-44 bg-slate-200 dark:bg-navy-700" />
            <SkeletonPulse className="h-3 w-32 bg-slate-100 dark:bg-navy-800" />
          </div>
        </div>
        <SkeletonPulse className="h-7 w-24 rounded-full bg-royal-50 dark:bg-navy-800" />
      </div>

      {/* Simulated module progress bars */}
      <div className="space-y-4 pt-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="p-3.5 rounded-xl border border-slate-100 dark:border-navy-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <SkeletonPulse className="h-4 w-48 bg-slate-200 dark:bg-navy-700" />
              <SkeletonPulse className="h-4 w-12 bg-slate-200 dark:bg-navy-700" />
            </div>
            <SkeletonPulse className="h-2.5 w-full bg-slate-200 dark:bg-navy-800 rounded-full" />
            <div className="flex justify-between items-center pt-1">
              <SkeletonPulse className="h-3 w-28 bg-slate-100 dark:bg-navy-800" />
              <SkeletonPulse className="h-3 w-20 bg-slate-100 dark:bg-navy-800" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Comprehensive Dashboard Grid Skeleton layout
 */
export const DashboardOverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse-subtle">
      {/* Top Banner / Welcome Skeleton */}
      <div className="p-6 rounded-3xl bg-slate-200 dark:bg-navy-800/80 border border-slate-300/50 dark:border-navy-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonPulse className="h-7 w-64 bg-slate-300 dark:bg-navy-700" />
          <SkeletonPulse className="h-4 w-96 bg-slate-300/80 dark:bg-navy-700/80" />
        </div>
        <div className="flex gap-3">
          <SkeletonPulse className="h-10 w-32 rounded-xl bg-slate-300 dark:bg-navy-700" />
          <SkeletonPulse className="h-10 w-32 rounded-xl bg-slate-300 dark:bg-navy-700" />
        </div>
      </div>

      {/* Metric Tiles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTileSkeleton />
        <MetricTileSkeleton />
        <MetricTileSkeleton />
        <MetricTileSkeleton />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LearningProgressSkeleton />
          <ChartCardSkeleton title="Quiz Score Progress" />
          <CardSkeleton lines={4} height="240px" />
        </div>
        <div className="space-y-6">
          <CardSkeleton lines={3} height="200px" />
          <CardSkeleton lines={4} height="220px" />
          <CardSkeleton lines={3} height="180px" />
        </div>
      </div>
    </div>
  );
};
