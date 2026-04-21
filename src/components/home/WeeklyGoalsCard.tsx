import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/useStore';
import { useI18n } from '@/hooks/useI18n';
import { sound } from '@/services/audio';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';

export function WeeklyGoalsCard() {
  const store = useStore();
  const { t } = useI18n();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const [expanded, setExpanded] = useState(true);
  const [tooltipGoalId, setTooltipGoalId] = useState<string | null>(null);
  const completionSnapshotRef = useRef<Record<string, boolean>>({});
  const hasInitializedCompletionRef = useRef(false);

  useEffect(() => {
    if (store.weeklyGoals.length === 0) {
      store.refreshWeeklyGoals();
    }
  }, [store]);

  useEffect(() => {
    const nextSnapshot: Record<string, boolean> = {};
    let hasNewCompletion = false;

    store.weeklyGoals.forEach((goal) => {
      const wasCompleted = completionSnapshotRef.current[goal.id];
      nextSnapshot[goal.id] = goal.completed;
      if (hasInitializedCompletionRef.current && goal.completed && !wasCompleted) {
        hasNewCompletion = true;
      }
    });

    completionSnapshotRef.current = nextSnapshot;
    if (!hasInitializedCompletionRef.current) {
      hasInitializedCompletionRef.current = true;
      return;
    }

    if (hasNewCompletion) {
      sound.celebration();
    }
  }, [store.weeklyGoals]);

  useEffect(() => {
    if (!tooltipGoalId) return;
    const timer = setTimeout(() => setTooltipGoalId(null), 1400);
    return () => clearTimeout(timer);
  }, [tooltipGoalId]);

  const completedCount = store.weeklyGoals.filter((goal) => goal.completed).length;
  const allComplete = store.weeklyGoals.length > 0 && completedCount === store.weeklyGoals.length;

  const streakLabel = useMemo(
    () => `${store.currentStreak} ${store.currentStreak === 1 ? 'week' : 'weeks'}`,
    [store.currentStreak]
  );

  const handleGoalPress = (goalId: string, completed: boolean) => {
    if (completed) return;
    sound.light();
    setTooltipGoalId(goalId);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: `${themeColors.primary[500]}40`,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>This Week</Text>
          <Text style={[styles.streakText, { color: themeColors.text.secondary }]}>🔥 {streakLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            sound.light();
            setExpanded((value) => !value);
          }}
          style={styles.chevronButton}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse weekly goals' : 'Expand weekly goals'}
        >
          <Text style={[styles.chevron, { color: themeColors.text.secondary }]}>{expanded ? '▾' : '▸'}</Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.content}>
          {store.weeklyGoals.length === 0 ? (
            <Text style={[styles.emptyState, { color: themeColors.text.muted }]}>Preparing this week&apos;s goals...</Text>
          ) : allComplete ? (
            <View
              style={[
                styles.completeState,
                {
                  backgroundColor: `${themeColors.success}22`,
                  borderColor: `${themeColors.success}55`,
                },
              ]}
            >
              <Text style={[styles.completeTitle, { color: themeColors.text.primary }]}>🎉 Week complete! New goals Sunday.</Text>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {store.weeklyGoals.map((goal) => {
                const ratio = goal.target > 0 ? Math.min(1, goal.current / goal.target) : 0;
                const isCompleted = goal.completed;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => handleGoalPress(goal.id, isCompleted)}
                    activeOpacity={0.85}
                    style={[
                      styles.goalRow,
                      isCompleted && {
                        backgroundColor: `${themeColors.success}1f`,
                        borderColor: `${themeColors.success}44`,
                      },
                    ]}
                  >
                    <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                    <View style={styles.goalBody}>
                      <View style={styles.goalTopLine}>
                        <Text
                          style={[
                            styles.goalDescription,
                            { color: themeColors.text.primary },
                            isCompleted && { textDecorationLine: 'line-through', color: themeColors.text.muted },
                          ]}
                        >
                          {t(goal.description)}
                        </Text>
                        {isCompleted ? <Text style={[styles.checkmark, { color: themeColors.success }]}>✓</Text> : null}
                      </View>
                      <Text style={[styles.progressText, { color: themeColors.text.secondary }]}>
                        {goal.current} / {goal.target}
                      </Text>
                      <View style={[styles.progressTrack, { backgroundColor: themeColors.cardLight }]}>
                        <LinearGradient
                          colors={[themeColors.primary[400], themeColors.primary[500]]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${ratio * 100}%` }]}
                        />
                      </View>
                      {tooltipGoalId === goal.id && !isCompleted ? (
                        <Text style={[styles.tooltip, { color: themeColors.primary[400] }]}>
                          Keep going — you&apos;re almost there 🌸
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    maxHeight: 320,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  streakText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  chevronButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    marginTop: 10,
  },
  emptyState: {
    fontSize: 13,
  },
  completeState: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  completeTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  goalsList: {
    gap: 8,
  },
  goalRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  goalEmoji: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  goalBody: {
    flex: 1,
  },
  goalTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalDescription: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '800',
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: 6,
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  tooltip: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
});

