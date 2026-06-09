<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Constraint, Member, PriorityRank, GradeMode, ConstraintType } from '../types';

const props = defineProps<{ constraints: Constraint[]; members: Member[]; gradeMode: GradeMode; }>();
const emit = defineEmits<{ (e: 'add', constraint: Constraint): void; (e: 'remove', id: string): void; }>();

const selectedType = ref<ConstraintType>('gender_separate');
const selectedPriority = ref<PriorityRank>('A');
const selectedMember1 = ref('');
const selectedMember2 = ref('');
const selectedTag = ref(''); 

const availableTags = computed(() => {
  const tags = new Set<string>();
  props.members.forEach(m => m.tags?.forEach(t => tags.add(t)));
  return Array.from(tags);
});

const handleAdd = () => {
  if (selectedType.value === 'pair' && (!selectedMember1.value || !selectedMember2.value || selectedMember1.value === selectedMember2.value)) {
    alert('異なる2人のメンバーを選択してください。'); return;
  }
  if ((selectedType.value === 'tag_grouped' || selectedType.value === 'tag_separate') && !selectedTag.value) {
    alert('対象となるタグを選択してください。'); return;
  }

  emit('add', {
    id: 'c_' + Date.now(),
    type: selectedType.value,
    priority: selectedPriority.value,
    targetIds: selectedType.value === 'pair' ? [selectedMember1.value, selectedMember2.value] : undefined,
    targetTag: (selectedType.value === 'tag_grouped' || selectedType.value === 'tag_separate') ? selectedTag.value : undefined 
  });
};

const getTypeLabel = (type: string, tag?: string) => {
  switch (type) {
    case 'gender_separate': return '男女を分ける';
    case 'grade_grouped': return '学年が固まるようにする';
    case 'grade_even': return '学年が均等になるようにする';
    case 'pair': return '特定の2人を一緒にする';
    case 'tag_grouped': return `【${tag}】を同じ部屋に集める`; 
    case 'tag_separate': return `【${tag}】を別の部屋に分散させる`; 
    default: return type;
  }
};
</script>

<template>
  <div style="border: 1px solid #e0e0e0; padding: 25px; margin-bottom: 20px; border-radius: 12px; background-color: #f5f7fa; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">⚠️</span> 条件設定
      </h2>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: flex-start; margin-bottom: 25px; flex-wrap: wrap; align-items: center;">
      <select v-model="selectedType" style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white;">
        <option value="gender_separate">男女を分ける</option>
        <option v-if="gradeMode !== 'none'" value="grade_grouped">学年が固まるようにする</option>
        <option v-if="gradeMode !== 'none'" value="grade_even">学年が均等になるようにする</option>
        <option value="pair">特定の2人を一緒にする</option>
        <option v-if="availableTags.length > 0" value="tag_grouped">特定のタグを持つ人を同じ部屋に集める</option>
        <option v-if="availableTags.length > 0" value="tag_separate">特定のタグを持つ人を別の部屋に分散させる</option>
      </select>

      <select v-model="selectedPriority" style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white;">
        <option value="S">絶対 (S)</option>
        <option value="A">なるべく (A)</option>
        <option value="B">できれば (B)</option>
      </select>

      <template v-if="selectedType === 'pair'">
        <select v-model="selectedMember1" style="padding: 10px; font-size: 15px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white;">
          <option value="" disabled>メンバー1</option><option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <span style="font-weight: bold; color: #555;">と</span>
        <select v-model="selectedMember2" style="padding: 10px; font-size: 15px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white;">
          <option value="" disabled>メンバー2</option><option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </template>

      <template v-if="selectedType === 'tag_grouped' || selectedType === 'tag_separate'">
        <select v-model="selectedTag" style="padding: 10px; font-size: 15px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white; min-width: 150px;">
          <option value="" disabled>タグを選択...</option>
          <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </template>

      <button @click="handleAdd" style="padding: 10px 24px; background-color: #1e88e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">
        ＋ 追加
      </button>
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
      <li v-for="c in constraints" :key="c.id" style="display: flex; justify-content: space-between; background-color: white; padding: 12px 15px; border: 1px solid #eee; border-radius: 8px; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
        <span style="font-size: 16px; font-weight: bold; color: #333;">
          {{ getTypeLabel(c.type, c.targetTag) }}
          <span style="color: #666; font-size: 14px; margin-left: 10px; font-weight: normal;">(優先度: {{ c.priority }})</span>
          <span v-if="c.type === 'pair' && c.targetIds" style="color: #1e88e5; margin-left: 10px; font-size: 14px;">
            [ {{ members.find(m => m.id === c.targetIds![0])?.name }} & {{ members.find(m => m.id === c.targetIds![1])?.name }} ]
          </span>
        </span>
        <button @click="emit('remove', c.id)" style="background-color: #ef5350; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-size: 13px; font-weight: bold; transition: background-color 0.2s;">
          削除
        </button>
      </li>
    </ul>
    <p v-if="constraints.length === 0" style="color: #888; font-size: 15px; text-align: center; margin: 30px 0;">
      条件が登録されていません。
    </p>
  </div>
</template>