import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../src/context';
import { ProjectInfoSection, FloorManager, SteelToggle, ElementSection } from '../src/components/FormSections';
import { MixDesignSection } from '../src/components/MixDesign';
import { ResultsView } from '../src/components/ResultsView';
import { SavedProjectsPanel } from '../src/components/SavedProjects';
import { colors, spacing, borderRadius, fontSize } from '../src/theme';
import { isPricesValid } from '../src/calculations';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { includeSteel, project, handleCalculate, handleReset, setShowSavedPanel } = useApp();
  const scrollRef = useRef<ScrollView>(null);

  const canCalculate = isPricesValid(project, includeSteel);

  const handleCalc = () => {
    if (!canCalculate) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال سعر الخرسانة' + (includeSteel ? ' وسعر الحديد' : '') + ' أولاً.');
      return;
    }
    handleCalculate();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSavedPanel(true)} activeOpacity={0.7} style={styles.savedBtn}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>المشاريع المحفوظة</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        <ProjectInfoSection />
        <FloorManager />
        <SteelToggle />
        <ElementSection />
        <MixDesignSection />

        {/* Calculate & Reset Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity onPress={handleCalc} activeOpacity={0.8}
            style={[styles.calcButton, !canCalculate && { opacity: 0.5 }]}>
            <Text style={styles.calcButtonText}>احتساب الكميات</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7} style={styles.resetButton}>
            <Text style={{ color: colors.danger, fontWeight: '600', fontSize: fontSize.sm }}>إعادة تعيين</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <ResultsView />

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      <SavedProjectsPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  savedBtn: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  calcButton: {
    flex: 1,
    backgroundColor: colors.slate[800],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  calcButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  resetButton: {
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
});
