import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useApp } from '../context';
import { ElementType, TAB_META, SLAB_SUBTYPES, SlabSubType } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function ProjectInfoSection() {
  const { project, handleProjectChange } = useApp();
  const fields = [
    { key: 'projectName', label: 'اسم المشروع', placeholder: 'مثال: مشروع فلل الريان', optional: true },
    { key: 'engineerName', label: 'اسم المهندس', placeholder: 'م. ماجد القبضة', optional: true },
    { key: 'clientName', label: 'المقاول / صاحب العمل', placeholder: 'اسم العميل', optional: true },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>بيانات المشروع والتوثيق</Text>
      {fields.map((f) => (
        <View key={f.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{f.label} {f.optional && <Text style={{ color: colors.slate[400] }}>(اختياري)</Text>}</Text>
          <TextInput
            style={styles.input}
            value={project[f.key as keyof typeof project] as string}
            onChangeText={(v) => handleProjectChange(f.key, v)}
            placeholder={f.placeholder}
            placeholderTextColor={colors.slate[400]}
            textAlign="right"
          />
        </View>
      ))}
    </View>
  );
}

export function FloorManager() {
  const { floors, addFloor, removeFloor } = useApp();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>الطوابق</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {floors.map((f) => (
          <TouchableOpacity key={f.id} onPress={() => removeFloor(f.id)} activeOpacity={0.7}
            style={[styles.floorBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.floorBadgeText, { color: colors.primaryDark }]}>{f.name}</Text>
            <Text style={{ color: colors.danger, fontSize: fontSize.xs, marginLeft: 4 }}>✕</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={addFloor} activeOpacity={0.7} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ إضافة طابق</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SteelToggle() {
  const { includeSteel, setIncludeSteel, project, handleProjectChange } = useApp();
  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={styles.sectionTitle}>الأسعار والمعدلات</Text>
        <TouchableOpacity
          onPress={() => setIncludeSteel((v) => !v)}
          activeOpacity={0.7}
          style={[styles.toggleButton, includeSteel ? styles.toggleActive : styles.toggleInactive]}
        >
          <Text style={[styles.toggleText, { color: includeSteel ? colors.white : colors.slate[600] }]}>
            {includeSteel ? 'حديد التسليح: مفعّل' : 'خرسانة فقط'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>سعر م³ الخرسانة</Text>
          <TextInput style={styles.input} value={project.concretePricePerM3}
            onChangeText={(v) => handleProjectChange('concretePricePerM3', v)}
            placeholder="0.00" keyboardType="decimal-pad" textAlign="center"
            placeholderTextColor={colors.slate[400]} />
        </View>
        {includeSteel && (
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>سعر طن الحديد</Text>
            <TextInput style={styles.input} value={project.steelPricePerTon}
              onChangeText={(v) => handleProjectChange('steelPricePerTon', v)}
              placeholder="0.00" keyboardType="decimal-pad" textAlign="center"
              placeholderTextColor={colors.slate[400]} />
          </View>
        )}
      </View>
      {includeSteel && (
        <>
          <Text style={[styles.label, { marginTop: spacing.md, color: colors.slate[500] }]}>معدلات حديد العناصر (كجم/م³)</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
            {(['footingSteelRatio', 'columnSteelRatio', 'beamSteelRatio'] as const).map((k) => (
              <View key={k} style={{ flex: 1 }}>
                <Text style={[styles.label, { fontSize: fontSize.xs }]}>
                  {k === 'footingSteelRatio' ? 'القواعد' : k === 'columnSteelRatio' ? 'الأعمدة' : 'الكمرات'}
                </Text>
                <TextInput style={[styles.input, { paddingVertical: 8 }]} value={project[k]}
                  onChangeText={(v) => handleProjectChange(k, v)} placeholder="0" keyboardType="number-pad"
                  textAlign="center" placeholderTextColor={colors.slate[400]} />
              </View>
            ))}
          </View>
          <Text style={[styles.label, { marginTop: spacing.md, color: colors.slate[500] }]}>معدلات حديد البلاطات (كجم/م³)</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
            {(['solidSlabSteelRatio', 'hollowSlabSteelRatio', 'flatSlabSteelRatio', 'waffleSlabSteelRatio'] as const).map((k) => (
              <View key={k} style={{ flex: 1 }}>
                <Text style={[styles.label, { fontSize: fontSize.xs }]}>
                  {k === 'solidSlabSteelRatio' ? 'مصمتة' : k === 'hollowSlabSteelRatio' ? 'مجوفة' : k === 'flatSlabSteelRatio' ? 'مسطحة' : 'واف'}
                </Text>
                <TextInput style={[styles.input, { paddingVertical: 8 }]} value={project[k]}
                  onChangeText={(v) => handleProjectChange(k, v)} placeholder="0" keyboardType="number-pad"
                  textAlign="center" placeholderTextColor={colors.slate[400]} />
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export function ElementInputCard({
  element, idx, dim1Label, dim2Label, dim3Label, defaultLabel,
  tabCount, floors, onRemove,
}: {
  element: ElementType; idx: number;
  dim1Label: string; dim2Label: string; dim3Label: string; defaultLabel: string;
  tabCount: number; floors: { id: string; name: string }[];
  onRemove: () => void;
}) {
  const { handleElementChange, setActiveTab } = useApp();
  return (
    <View style={styles.elementCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={{ fontWeight: '700', color: colors.slate[700] }}>عنصر {idx + 1}</Text>
        {tabCount > 1 && (
          <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
            <Text style={{ color: colors.danger, fontSize: fontSize.lg }}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>المسمى</Text>
          <TextInput style={styles.input} value={element.label}
            onChangeText={(v) => handleElementChange(element.id, 'label', v)}
            placeholder={`مثال: ${defaultLabel}${idx + 1}`} textAlign="right"
            placeholderTextColor={colors.slate[400]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>الطابق</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => {
                const cur = floors.findIndex((f) => f.id === element.floorId);
                const next = (cur + 1) % floors.length;
                handleElementChange(element.id, 'floorId', floors[next].id);
              }}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>
                {floors.find((f) => f.id === element.floorId)?.name || 'اختر'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[
          { key: 'dim1', label: dim1Label },
          { key: 'dim2', label: dim2Label },
          { key: 'dim3', label: dim3Label },
          { key: 'quantity', label: 'العدد' },
        ].map((f) => (
          <View key={f.key} style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: fontSize.xs }]}>{f.label}</Text>
            <TextInput style={styles.input} value={element[f.key as keyof ElementType] as string}
              onChangeText={(v) => handleElementChange(element.id, f.key, v)}
              placeholder={f.key === 'quantity' ? '1' : '0'} keyboardType="decimal-pad"
              textAlign="center" placeholderTextColor={colors.slate[400]} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ElementSection() {
  const { activeTab, setActiveTab, slabSubTab, setSlabSubTab, floors, footings, setFootings, columns, setColumns, beams, setBeams, solidSlabs, setSolidSlabs, hollowSlabs, setHollowSlabs, flatSlabs, setFlatSlabs, waffleSlabs, setWaffleSlabs, addElement, removeElement } = useApp();

  const tabConfig = TAB_META.find((t) => t.id === activeTab)!;

  if (activeTab !== 'slabs') {
    const map: { [key: string]: [ElementType[], React.Dispatch<React.SetStateAction<ElementType[]>>] } = {
      footings: [footings, setFootings],
      columns: [columns, setColumns],
      beams: [beams, setBeams],
    };
    const [elements, setter] = map[activeTab];
    const defaultFloorId = floors[0]?.id || '';

    return (
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
          {TAB_META.filter((t) => t.id !== 'slabs').map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setActiveTab(t.id)} activeOpacity={0.7}
              style={[styles.tabButton, activeTab === t.id && styles.tabButtonActive]}>
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setActiveTab('slabs')} activeOpacity={0.7}
            style={[styles.tabButton, activeTab === 'slabs' && styles.tabButtonActive]}>
            <Text style={[styles.tabText, activeTab === 'slabs' && styles.tabTextActive]}>البلاطات</Text>
          </TouchableOpacity>
        </View>
        {(elements as ElementType[]).map((el, idx) => (
          <ElementInputCard key={el.id} element={el} idx={idx}
            dim1Label={tabConfig.dim1Label} dim2Label={tabConfig.dim2Label} dim3Label={tabConfig.dim3Label}
            defaultLabel={tabConfig.defaultLabel} tabCount={elements.length} floors={floors}
            onRemove={() => removeElement(elements, setter, el.id)} />
        ))}
        <TouchableOpacity onPress={() => addElement(setter, defaultFloorId)} activeOpacity={0.7} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ إضافة عنصر</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Slabs section
  const slabMap: { [key: string]: [ElementType[], React.Dispatch<React.SetStateAction<ElementType[]>>] } = {
    solid: [solidSlabs, setSolidSlabs],
    hollow: [hollowSlabs, setHollowSlabs],
    flat: [flatSlabs, setFlatSlabs],
    waffle: [waffleSlabs, setWaffleSlabs],
  };
  const [slabElements, slabSetter] = slabMap[slabSubTab];
  const slabMeta = SLAB_SUBTYPES.find((s) => s.id === slabSubTab)!;
  const defaultFloorId = floors[0]?.id || '';

  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
        {TAB_META.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setActiveTab(t.id)} activeOpacity={0.7}
            style={[styles.tabButton, activeTab === t.id && styles.tabButtonActive]}>
            <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
        {SLAB_SUBTYPES.map((s) => (
          <TouchableOpacity key={s.id} onPress={() => setSlabSubTab(s.id)} activeOpacity={0.7}
            style={[styles.subTabButton, slabSubTab === s.id && styles.subTabButtonActive]}>
            <Text style={[styles.subTabText, slabSubTab === s.id && styles.subTabTextActive]}>{s.shortLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {slabElements.map((el, idx) => (
        <ElementInputCard key={el.id} element={el} idx={idx}
          dim1Label="الطول (م)" dim2Label="العرض (م)" dim3Label="السمك (م)"
          defaultLabel={slabMeta.defaultLabel} tabCount={slabElements.length} floors={floors}
          onRemove={() => removeElement(slabElements, slabSetter, el.id)} />
      ))}
      <TouchableOpacity onPress={() => addElement(slabSetter, defaultFloorId)} activeOpacity={0.7} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ إضافة عنصر</Text>
      </TouchableOpacity>
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
    color: colors.primary,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.slate[600],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.slate[800],
    backgroundColor: colors.white,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
  },
  floorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  floorBadgeText: {
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  addButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#bfdbfe',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  elementCard: {
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  subTabButton: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    backgroundColor: colors.slate[100],
  },
  subTabButtonActive: {
    backgroundColor: colors.orange,
  },
  subTabText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.slate[600],
  },
  subTabTextActive: {
    color: colors.white,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  toggleActive: {
    backgroundColor: colors.slate[800],
    borderColor: colors.slate[800],
  },
  toggleInactive: {
    backgroundColor: colors.slate[50],
    borderColor: colors.slate[200],
  },
  toggleText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
