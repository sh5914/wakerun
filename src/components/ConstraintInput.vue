<script setup lang="ts">
import { ref } from 'vue';
import type { Constraint, Member, PriorityRank, GradeMode } from '../types'; // 🌟 GradeModeを追加

const props = defineProps<{
  constraints: Constraint[];
  members: Member[];
  gradeMode: GradeMode; 
}>();

const emit = defineEmits<{
  (e: 'add', constraint: Constraint): void;
  (e: 'remove', id: string): void;
}>();

const selectedType = ref<'pair' | 'gender_separate' | 'grade_grouped' | 'grade_even'>('gender_separate');
const selectedPriority = ref<PriorityRank>('A');
const selectedMember1 = ref<string>('');
const selectedMember2 = ref<string>('');

const handleAdd = () => {
  if (selectedType.value === 'pair') {
    if (!selectedMember1.value || !selectedMember2.value) return;
    if (selectedMember1.value === selectedMember2.value) return;
  }

  const newConstraint: Constraint = {
    id: 'c_' + Date.now(),
    type: selectedType.value,
    priority: selectedPriority.value,
  };

  if (selectedType.value === 'pair') {
    newConstraint.targetMemberIds = [selectedMember1.value, selectedMember2.value];
  }

  emit('add', newConstraint);

  selectedMember1.value = '';
  selectedMember2.value = '';
};

const getConstraintLabel = (c: Constraint) => {
  if (c.type === 'gender_separate') return '男女を分ける';
  if (c.type === 'grade_grouped') return '学年が固まるようにする';
  if (c.type === 'grade_even') return '学年が均等になるようにする';
  if (c.type === 'pair' && c.targetMemberIds) {
    const m1 = props.members.find(m => m.id === c.targetMemberIds![0])?.name || '不明';
    const m2 = props.members.find(m => m.id === c.targetMemberIds![1])?.name || '不明';
    return `${m1} さん と ${m2} さん を一緒の部屋にする`;
  }
  return '不明な条件';
};
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #fafafa;">
    <h2 style="margin-top: 0;">⚠️ 条件設定</h2>
    
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
      
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <select v-model="selectedType" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
          <option value="gender_separate">男女を分ける</option>
          <option v-if="gradeMode !== 'none'" value="grade_grouped">学年が固まるようにする</option>
          <option v-if="gradeMode !== 'none'" value="grade_even">学年が均等になるようにする</option>
          <option value="pair">特定の2人を一緒にする</option>
        </select>

        <select v-model="selectedPriority" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
          <option value="S">絶対 (S)</option>
          <option value="A">なるべく (A)</option>
          <option value="B">できれば (B)</option>
        </select>
        
        <button 
          v-if="selectedType !== 'pair'"
          @click="handleAdd" 
          style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"
        >
          ＋ 追加
        </button>
      </div>

      <div v-if="selectedType === 'pair'" style="display: flex; gap: 10px; align-items: center; padding-left: 10px; border-left: 3px solid #007bff;">
        <select v-model="selectedMember1" style="padding: 8px; font-size: 14px; border: 1px solid #aaa; border-radius: 4px;">
          <option value="" disabled>誰を？</option>
          <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <span>と</span>
        <select v-model="selectedMember2" style="padding: 8px; font-size: 14px; border: 1px solid #aaa; border-radius: 4px;">
          <option value="" disabled>誰と？</option>
          <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        
        <button 
          @click="handleAdd" 
          style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"
        >
          ＋ 追加
        </button>
      </div>

    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0;">
      <li 
        v-for="c in constraints" 
        :key="c.id"
        style="display: flex; justify-content: space-between; background-color: white; padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px; align-items: center;"
      >
        <span>
          <strong style="color: #d9534f;">[{{ c.priority }}]</strong> 
          {{ getConstraintLabel(c) }}
        </span>
        <button 
          @click="emit('remove', c.id)" 
          style="background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 4px 10px;"
        >
          削除
        </button>
      </li>
    </ul>
    
    <p v-if="constraints.length === 0" style="color: #777; font-size: 14px;">
      条件が登録されていません。
    </p>
  </div>
</template>