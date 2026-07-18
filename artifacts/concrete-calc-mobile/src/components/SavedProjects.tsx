import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useApp } from '../context';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { fmt } from '../calculations';

export function SavedProjectsPanel() {
  const { savedProjects, showSavedPanel, setShowSavedPanel, saveProject, loadProject, deleteProject, project } = useApp();
  const [saveName, setSaveName] = useState('');

  if (!showSavedPanel) return null;

  const handleSave = () => {
    saveProject(saveName);
    setSaveName('');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من حذف "${name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontWeight: '700', fontSize: fontSize.lg, color: colors.slate[800] }}>
            المشاريع المحفوظة ({savedProjects.length})
          </Text>
          <TouchableOpacity onPress={() => setShowSavedPanel(false)} activeOpacity={0.7}>
            <Text style={{ fontSize: fontSize.xl, color: colors.slate[500] }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Save current */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
          <TextInput style={[styles.input, { flex: 1 }]} value={saveName}
            onChangeText={setSaveName} placeholder="اسم المشروع (اختياري)"
            placeholderTextColor={colors.slate[400]} textAlign="right" />
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={styles.saveButton}>
            <Text style={{ color: colors.white, fontWeight: '600', fontSize: fontSize.sm }}>حفظ</Text>
          </TouchableOpacity>
        </View>

        {/* Project list */}
        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
          {savedProjects.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
              <Text style={{ color: colors.slate[400], fontSize: fontSize.md }}>لا توجد مشاريع محفوظة</Text>
            </View>
          ) : (
            savedProjects.map((sp) => (
              <View key={sp.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.slate[100] }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.slate[800] }}>{sp.name}</Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.slate[400] }}>
                    {new Date(sp.savedAt).toLocaleDateString('ar-SA')} • {sp.floors.length} طوابق
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(sp.id, sp.name)} activeOpacity={0.7} style={{ padding: spacing.sm }}>
                  <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>حذف</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => loadProject(sp)} activeOpacity={0.7} style={styles.loadButton}>
                  <Text style={{ color: colors.white, fontWeight: '600', fontSize: fontSize.xs }}>تحميل</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '70%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.slate[800],
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
});
