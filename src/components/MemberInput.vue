<script setup lang="ts">
import { ref } from 'vue';
import type { Member, GradeMode } from '../types';

const props = defineProps<{
  members: Member[];
  gradeMode: GradeMode;
}>();

const emit = defineEmits<{
  (e: 'add', member: Member): void;
  (e: 'remove', id: string): void;
}>();

const inputName = ref('');
const selectedGrade = ref<string | number>('3');
const selectedGender = ref<'male' | 'female'>('male');

const handleAdd = () => {
  if (!inputName.value) return;

  emit('add', {
    id: 'm_' + Date.now(),
    name: inputName.value,
    // 学年を使用しないモードの時はダミー値を入れる
    grade: props.gradeMode === 'none' ? 'none' : selectedGrade.value,
    gender: selectedGender.value
  });

  // 名前だけ空にして、学年と性別は連続で追加しやすいようにそのまま残す
  inputName.value = '';
};

// 学年の表示を整える関数（M1ならそのまま、数字なら「年」をつける）
const formatGrade = (grade: string | number) => {
  if (isNaN(Number(grade))) {
    return String(grade);
  }
  return `${grade}年`;
};
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #fafafa;">
    <h2 style="margin-top: 0; text-align: center;">👤 メンバー設定</h2>
    
    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
      <input 
        v-model="inputName" 
        placeholder="名前 (例: SH)" 
        style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px; flex: 1; min-width: 150px;"
        @keyup.enter="handleAdd"
      />
      
      <select v-if="gradeMode !== 'none'" v-model="selectedGrade" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
        <template v-if="gradeMode === 'normal'">
          <option value="1">1年</option>
          <option value="2">2年</option>
          <option value="3">3年</option>
          <option value="4">4年</option>
          <option value="4">5年</option>
          <option value="4">6年</option>
        </template>
        <template v-if="gradeMode === 'univ'">
          <option value="B1">学部1年 (B1)</option>
          <option value="B2">学部2年 (B2)</option>
          <option value="B3">学部3年 (B3)</option>
          <option value="B4">学部4年 (B4)</option>
          <option value="M1">修士1年 (M1)</option>
          <option value="M2">修士2年 (M2)</option>
          <option value="OB">OB / OG</option>
        </template>
      </select>

      <select v-model="selectedGender" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
        <option value="male">男性</option>
        <option value="female">女性</option>
      </select>

      <button 
        @click="handleAdd" 
        style="padding: 8px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;"
      >
        ＋ 追加
      </button>
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0;">
      <li 
        v-for="m in members" 
        :key="m.id" 
        style="display: flex; justify-content: space-between; background-color: white; padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px; align-items: center;"
      >
        <span style="font-size: 16px; font-weight: bold;">
          {{ m.name }}
          
          <span v-if="gradeMode === 'none'" style="color: #666; font-size: 14px; font-weight: normal; margin-left: 10px;">
            ({{ m.gender === 'male' ? '男性' : '女性' }})
          </span>
          <span v-else style="color: #666; font-size: 14px; font-weight: normal; margin-left: 10px;">
            ({{ formatGrade(m.grade) }} / {{ m.gender === 'male' ? '男性' : '女性' }})
          </span>
        </span>
        <button 
          @click="emit('remove', m.id)" 
          style="background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 5px 10px;"
        >
          削除
        </button>
      </li>
    </ul>

    <p v-if="members.length === 0" style="color: #777; font-size: 14px; text-align: center;">
      メンバーが登録されていません。
    </p>
  </div>
</template>