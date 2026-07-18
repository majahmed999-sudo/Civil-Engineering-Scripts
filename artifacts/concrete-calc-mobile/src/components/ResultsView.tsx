import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useApp } from '../context';
import { SectionSummary, FloorBreakdown, ResultsTab, BOQItem, BOQ_META } from '../types';
import { computeMix, computeBOQ, fmt } from '../calculations';
import { colors, spacing, borderRadius, fontSize } from '../theme';

function SectionTable({ section, title }: { section: SectionSummary; title: string }) {
  if (section.elements.length === 0) return null;
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.slate[600], marginBottom: spacing.xs }}>{title}</Text>
      <View style={{ borderRadius: borderRadius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.slate[200] }}>
        <View style={{ backgroundColor: colors.slate[50], flexDirection: 'row', paddingVertical: spacing.sm }}>
          <Text style={[styles.th, { flex: 2 }]}>النوع</Text>
          <Text style={[styles.th, { flex: 2 }]}>الأبعاد</Text>
          <Text style={[styles.th, { flex: 1 }]}>العدد</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>الحجم</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>الحديد</Text>
        </View>
        {section.elements.map((r, i) => (
          <View key={r.id} style={{ flexDirection: 'row', paddingVertical: spacing.xs + 2, backgroundColor: i % 2 === 0 ? colors.white : colors.slate[50] }}>
            <Text style={[styles.td, { flex: 2, fontWeight: '500', color: colors.slate[700] }]}>{r.label}</Text>
            <Text style={[styles.td, { flex: 2, color: colors.slate[500] }]}>{r.dim1}×{r.dim2}×{r.dim3}</Text>
            <Text style={[styles.td, { flex: 1 }]}>{r.quantity}</Text>
            <Text style={[styles.td, { flex: 1.5, fontWeight: '600', color: colors.primary }]}>{fmt(r.totalVolume)}</Text>
            <Text style={[styles.td, { flex: 1.5, fontWeight: '600' }]}>{fmt(r.steelKg, 1)}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, backgroundColor: '#dbeafe', borderTopWidth: 2, borderTopColor: '#bfdbfe' }}>
          <Text style={[styles.td, { flex: 6, fontWeight: '700', textAlign: 'right', paddingRight: spacing.md }]}>إجمالي {title}</Text>
          <Text style={[styles.td, { flex: 1.5, fontWeight: '700', color: colors.primary }]}>{fmt(section.totalVolume)}</Text>
          <Text style={[styles.td, { flex: 1.5, fontWeight: '700' }]}>{fmt(section.totalSteelKg, 1)}</Text>
        </View>
      </View>
    </View>
  );
}

function FloorCard({ breakdown }: { breakdown: FloorBreakdown }) {
  const [open, setOpen] = React.useState(false);
  if (breakdown.totalVolume <= 0) return null;
  const rows = [
    { label: 'القواعد', sec: breakdown.footings, color: '#dbeafe' },
    { label: 'الأعمدة', sec: breakdown.columns, color: '#ffedd5' },
    { label: 'الكمرات', sec: breakdown.beams, color: '#dcfce7' },
    { label: 'مصمتة', sec: breakdown.solidSlabs, color: '#f3e8ff' },
    { label: 'مجوفة', sec: breakdown.hollowSlabs, color: '#ffe4e6' },
    { label: 'مسطحة', sec: breakdown.flatSlabs, color: '#ccfbf1' },
    { label: 'واف', sec: breakdown.waffleSlabs, color: '#fef3c7' },
  ].filter((r) => r.sec.elements.length > 0);

  return (
    <View style={{ borderWidth: 1, borderColor: colors.slate[200], borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.sm }}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} activeOpacity={0.7}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.slate[50] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 28, height: 28, backgroundColor: colors.primary, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: fontSize.xs }}>{breakdown.floor.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={{ fontWeight: '700', color: colors.slate[800] }}>{breakdown.floor.name}</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.slate[500] }}>
              {fmt(breakdown.totalVolume)} م³ خرسانة • {fmt(breakdown.totalSteelTons, 3)} طن حديد
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ fontWeight: '700', color: colors.success }}>{fmt(breakdown.totalCost)}</Text>
          <Text style={{ color: colors.slate[400], fontSize: fontSize.lg }}>{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {open && (
        <View style={{ padding: spacing.md, backgroundColor: colors.white }}>
          {rows.map((r) => (
            <SectionTable key={r.label} section={r.sec} title={r.label} />
          ))}
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.slate[100] }}>
            <View style={{ flex: 1, backgroundColor: '#dbeafe', padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: '500' }}>خرسانة</Text>
              <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{fmt(breakdown.totalVolume)} م³</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.slate[100], padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[600], fontWeight: '500' }}>حديد</Text>
              <Text style={{ fontWeight: '700', color: colors.slate[800] }}>{fmt(breakdown.totalSteelTons, 3)} طن</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#dcfce7', padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.success, fontWeight: '500' }}>تكلفة الطابق</Text>
              <Text style={{ fontWeight: '700', color: colors.success }}>{fmt(breakdown.totalCost)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export function ResultsView() {
  const { summary, resultsTab, setResultsTab, floors, footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs, project, mix } = useApp();

  if (!summary) return null;

  const tabs: { key: ResultsTab; label: string }[] = [
    { key: 'byType', label: 'حسب النوع' },
    { key: 'byFloor', label: 'حسب الطابق' },
    { key: 'boq', label: 'جدول الكميات' },
  ];

  const typeSections = [
    { key: 'footings' as const, label: '🟦 القواعد' },
    { key: 'columns' as const, label: '🟧 الأعمدة' },
    { key: 'beams' as const, label: '🟩 الكمرات' },
    { key: 'solidSlabs' as const, label: '🟣 مصمتة' },
    { key: 'hollowSlabs' as const, label: '🔴 مجوفة' },
    { key: 'flatSlabs' as const, label: '🟢 مسطحة' },
    { key: 'waffleSlabs' as const, label: '🟡 واف' },
  ];

  const rawArrays = [footings, columns, beams, solidSlabs, hollowSlabs, flatSlabs, waffleSlabs];
  const cp = parseFloat(project.concretePricePerM3) || 0;
  const sp = parseFloat(project.steelPricePerTon) || 0;
  const boqItems: BOQItem[] = computeBOQ(summary, floors, rawArrays, cp, sp);
  const boqTotals = boqItems.reduce((a, i) => ({
    volTotal: a.volTotal + i.volTotal,
    steelKg: a.steelKg + i.steelKgTotal,
    cost: a.cost + i.costTotal,
  }), { volTotal: 0, steelKg: 0, cost: 0 });

  const totalVolume = summary.totalConcreteVolume;
  const mixResult = totalVolume > 0 ? computeMix(totalVolume, mix) : null;

  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setResultsTab(t.key)} activeOpacity={0.7}
            style={[styles.tabButton, resultsTab === t.key && styles.tabButtonActive]}>
            <Text style={[styles.tabText, resultsTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grand Summary */}
      <View style={{ backgroundColor: colors.slate[800], borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.slate[400] }}>خرسانة كلي</Text>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.white }}>{fmt(summary.totalConcreteVolume)} م³</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.slate[400] }}>حديد كلي</Text>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.white }}>{fmt(summary.totalSteelTons, 3)} طن</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.slate[400] }}>التكلفة الكلية</Text>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.white }}>{fmt(summary.grandTotal)}</Text>
          </View>
        </View>
      </View>

      {/* By Type */}
      {resultsTab === 'byType' && (
        <View>
          {typeSections.map(({ key, label }) => {
            const section = summary[key];
            if (section.elements.length === 0) return null;
            return <SectionTable key={key} section={section} title={label} />;
          })}
        </View>
      )}

      {/* By Floor */}
      {resultsTab === 'byFloor' && (
        <View>
          {summary.byFloor.map((bd) => (
            <FloorCard key={bd.floor.id} breakdown={bd} />
          ))}
        </View>
      )}

      {/* BOQ */}
      {resultsTab === 'boq' && (
        <View style={{ borderRadius: borderRadius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.slate[200] }}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={{ backgroundColor: colors.slate[50], flexDirection: 'row', paddingVertical: spacing.sm }}>
                <Text style={[styles.th, { minWidth: 30 }]}>#</Text>
                <Text style={[styles.th, { minWidth: 55 }]}>النوع</Text>
                <Text style={[styles.th, { minWidth: 50 }]}>الطابق</Text>
                <Text style={[styles.th, { minWidth: 40 }]}>الرمز</Text>
                <Text style={[styles.th, { minWidth: 50 }]}>الأبعاد</Text>
                <Text style={[styles.th, { minWidth: 30 }]}>ع</Text>
                <Text style={[styles.th, { minWidth: 50 }]}>حجم/و</Text>
                <Text style={[styles.th, { minWidth: 55 }]}>حجم كلي</Text>
                <Text style={[styles.th, { minWidth: 55 }]}>حديد</Text>
                <Text style={[styles.th, { minWidth: 60 }]}>تكلفة</Text>
              </View>
              {boqItems.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', paddingVertical: spacing.xs + 2, backgroundColor: i % 2 === 0 ? colors.white : colors.slate[50] }}>
                  <Text style={[styles.td, { minWidth: 30 }]}>{item.no}</Text>
                  <Text style={[styles.td, { minWidth: 55 }]}>{item.typeLabel}</Text>
                  <Text style={[styles.td, { minWidth: 50 }]}>{item.floorName}</Text>
                  <Text style={[styles.td, { minWidth: 40 }]}>{item.label}</Text>
                  <Text style={[styles.td, { minWidth: 50 }]}>{item.dim1}×{item.dim2}×{item.dim3}</Text>
                  <Text style={[styles.td, { minWidth: 30 }]}>{item.qty}</Text>
                  <Text style={[styles.td, { minWidth: 50 }]}>{fmt(item.volEach)}</Text>
                  <Text style={[styles.td, { minWidth: 55 }]}>{fmt(item.volTotal)}</Text>
                  <Text style={[styles.td, { minWidth: 55 }]}>{fmt(item.steelKgTotal, 1)}</Text>
                  <Text style={[styles.td, { minWidth: 60 }]}>{fmt(item.costTotal)}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, backgroundColor: colors.slate[800] }}>
                <Text style={[styles.td, { minWidth: 225, fontWeight: '700', color: colors.white }]}>المجموع الكلي</Text>
                <Text style={[styles.td, { minWidth: 55, fontWeight: '700', color: colors.white }]}>{fmt(boqTotals.volTotal)}</Text>
                <Text style={[styles.td, { minWidth: 55, fontWeight: '700', color: colors.white }]}>{fmt(boqTotals.steelKg, 1)}</Text>
                <Text style={[styles.td, { minWidth: 60, fontWeight: '700', color: colors.white }]}>{fmt(boqTotals.cost)}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Mix Design Results Summary */}
      {mixResult && (
        <View style={{ marginTop: spacing.md, backgroundColor: colors.orangeLight, borderRadius: borderRadius.md, padding: spacing.md }}>
          <Text style={{ fontWeight: '700', color: colors.orange, marginBottom: spacing.sm }}>كميات الخلطة الخرسانية للمشروع</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.sm }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[500] }}>أسمنت</Text>
              <Text style={{ fontWeight: '700', color: colors.slate[800] }}>{mixResult.cementBags} كيس</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.sm }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[500] }}>رمل</Text>
              <Text style={{ fontWeight: '700', color: colors.slate[800] }}>{fmt(mixResult.sandVolume)} م³</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white, padding: spacing.sm, borderRadius: borderRadius.sm }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[500] }}>زلط</Text>
              <Text style={{ fontWeight: '700', color: colors.slate[800] }}>{fmt(mixResult.gravelVolume)} م³</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[500], marginBottom: 2 }}>حجم جاف</Text>
              <Text style={{ fontWeight: '600' }}>{fmt(mixResult.dryVolume)} م³</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.slate[500], marginBottom: 2 }}>حجم أسمنت</Text>
              <Text style={{ fontWeight: '600' }}>{fmt(mixResult.cementVolume)} م³</Text>
            </View>
          </View>
        </View>
      )}
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
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.slate[100],
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.slate[600],
  },
  tabTextActive: {
    color: colors.white,
  },
  th: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.slate[600],
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  td: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    color: colors.slate[600],
    paddingHorizontal: spacing.xs,
  },
});
