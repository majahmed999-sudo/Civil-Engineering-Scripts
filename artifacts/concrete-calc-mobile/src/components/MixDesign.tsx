import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useApp } from '../context';
import { MIX_PRESETS } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function MixDesignSection() {
  const { mix, setMix } = useApp();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>تصميم الخلطة الخرسانية</Text>
      <Text style={[styles.label, { marginBottom: spacing.sm }]}>اختر نسبة الخلطة (أسمنت : رمل : زلط)</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {MIX_PRESETS.map((p) => {
          const active = mix.cement === p.c && mix.sand === p.s && mix.gravel === p.g;
          return (
            <TouchableOpacity key={p.label} onPress={() => setMix((m) => ({ ...m, cement: p.c, sand: p.s, gravel: p.g }))}
              activeOpacity={0.7}
              style={[styles.presetButton, active && styles.presetButtonActive]}>
              <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>{p.label}</Text>
              <Text style={[styles.presetGrade, active && styles.presetGradeActive]}>{p.grade}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.label, { marginBottom: spacing.sm }]}>نسبة مخصصة</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {[
          { key: 'cement' as const, label: 'أسمنت' },
          { key: 'sand' as const, label: 'رمل' },
          { key: 'gravel' as const, label: 'زلط' },
        ].map(({ key, label }) => (
          <View key={key} style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: fontSize.xs }]}>{label}</Text>
            <TextInput style={styles.input} value={mix[key]}
              onChangeText={(v) => setMix((m) => ({ ...m, [key]: v }))}
              placeholder="1" keyboardType="decimal-pad" textAlign="center"
              placeholderTextColor={colors.slate[400]} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.orangeLight, padding: spacing.md, borderRadius: borderRadius.md }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { fontSize: fontSize.xs }]}>معامل الانكماش</Text>
          <TextInput style={[styles.input, { borderColor: colors.orange }]} value={mix.compactionFactor}
            onChangeText={(v) => setMix((m) => ({ ...m, compactionFactor: v }))}
            placeholder="1.54" keyboardType="decimal-pad" textAlign="center"
            placeholderTextColor={colors.slate[400]} />
          <Text style={{ fontSize: fontSize.xs, color: colors.slate[400], marginTop: 2 }}>الافتراضي: 1.54</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { fontSize: fontSize.xs }]}>وزن الكيس (كجم)</Text>
          <TextInput style={[styles.input, { borderColor: colors.orange }]} value={mix.bagWeightKg}
            onChangeText={(v) => setMix((m) => ({ ...m, bagWeightKg: v }))}
            placeholder="50" keyboardType="number-pad" textAlign="center"
            placeholderTextColor={colors.slate[400]} />
          <Text style={{ fontSize: fontSize.xs, color: colors.slate[400], marginTop: 2 }}>قياسية: 50 كجم</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate[100],
    ...Platform.select({ web: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } }),
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.orange,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.slate[600],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.slate[800],
    backgroundColor: colors.white,
    marginTop: spacing.xs,
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.slate[200],
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  presetLabel: {
    fontWeight: '700',
    fontSize: fontSize.md,
    color: colors.slate[700],
  },
  presetLabelActive: {
    color: colors.white,
  },
  presetGrade: {
    fontSize: fontSize.xs,
    color: colors.slate[400],
    marginTop: 2,
  },
  presetGradeActive: {
    color: colors.orangeLight,
  },
});
