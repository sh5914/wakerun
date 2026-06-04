<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Member, GradeMode } from '../types';

const props = defineProps<{ members: Member[]; gradeMode: GradeMode; }>();
const emit = defineEmits<{ (e: 'add', member: Member): void; (e: 'remove', id: string): void; }>();

const inputName = ref('');
const selectedGrade = ref<string | number>('3');
const selectedGender = ref<'male' | 'female'>('male');
const inputTags = ref(''); // ✨ タグ入力用

const isBulkMode = ref(false);
const bulkText = ref('');

const hasMixedGrades = computed(() => {
  if (props.gradeMode === 'none') return false;
  let hasNumeric = false, hasString = false;
  for (const m of props.members) {
    if (m.grade === 'none') continue;
    if (!isNaN(Number(m.grade))) hasNumeric = true;
    else hasString = true;
  }
  return hasNumeric && hasString;
});

const handleAdd = () => {
  if (!inputName.value) return;
  // ✨ カンマやスペースで区切られたタグを配列にする
  const tags = inputTags.value.split(/[,\s]+/).map(t => t.trim()).filter(t => t);

  emit('add', {
    id: 'm_' + Date.now(),
    name: inputName.value,
    grade: props.gradeMode === 'none' ? 'none' : selectedGrade.value,
    gender: selectedGender.value,
    tags: tags // ✨ タグ情報を追加
  });
  inputName.value = '';
  inputTags.value = ''; // タグ欄をリセット
};

const handleBulkAdd = () => {
  if (!bulkText.value.trim()) return;
  const lines = bulkText.value.split('\n');
  let addedCount = 0;

  for (const line of lines) {
    const parts = line.trim().split(/[,\t\s]+/);
    if (parts.length === 0 || !parts[0]) continue;

    let name = parts[0];
    let grade: string | number = '3';
    let gender: 'male' | 'female' = 'male';
    let tags: string[] = [];

    if (props.gradeMode === 'none') {
      if (parts.length >= 2) {
        const gStr = parts[1].toLowerCase();
        if (gStr.includes('女') || gStr === 'f' || gStr === 'female') gender = 'female';
      }
      if (parts.length >= 3) tags = parts.slice(2); // ✨ 後ろの文字は全部タグとして扱う！
    } else {
      if (parts.length >= 2) grade = parts[1];
      if (parts.length >= 3) {
        const gStr = parts[2].toLowerCase();
        if (gStr.includes('女') || gStr === 'f' || gStr === 'female') gender = 'female';
      }
      if (parts.length >= 4) tags = parts.slice(3); // ✨ 後ろの文字は全部タグとして扱う！
    }

    emit('add', {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name, grade: props.gradeMode === 'none' ? 'none' : grade, gender, tags
    });
    addedCount++;
  }
  if (addedCount > 0) {
    alert(`${addedCount}名のメンバーを一括登録しました！`);
    bulkText.value = ''; isBulkMode.value = false;
  }
};

const formatGrade = (grade: string | number) => isNaN(Number(grade)) ? String(grade) : `${grade}年`;
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #fafafa;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h2 style="margin: 0;">👤 メンバー設定</h2>
      <button @click="isBulkMode = !isBulkMode" style="padding: 6px 12px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">
        {{ isBulkMode ? '✏️ 手動入力に戻す' : '📝 一括登録（コピペ）' }}
      </button>
    </div>
    
    <div v-if="!isBulkMode" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
      <input v-model="inputName" placeholder="名前 (例: SH)" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px; flex: 1; min-width: 120px;" @keyup.enter="handleAdd" />
      <select v-if="gradeMode !== 'none'" v-model="selectedGrade" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
        <template v-if="gradeMode === 'normal'">
          <option value="1">1年</option><option value="2">2年</option><option value="3">3年</option><option value="4">4年</option><option value="5">5年</option><option value="6">6年</option>
        </template>
        <template v-if="gradeMode === 'univ'">
          <option value="B1">学部1年 (B1)</option><option value="B2">学部2年 (B2)</option><option value="B3">学部3年 (B3)</option><option value="B4">学部4年 (B4)</option><option value="M1">修士1年 (M1)</option><option value="M2">修士2年 (M2)</option><option value="OB">OB / OG</option>
        </template>
      </select>
      <select v-model="selectedGender" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
        <option value="male">男性</option><option value="female">女性</option>
      </select>
      <input v-model="inputTags" placeholder="タグ (任意)" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px; flex: 1; min-width: 120px;" @keyup.enter="handleAdd" />
      <button @click="handleAdd" style="padding: 8px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">＋</button>
    </div>

    <div v-else style="margin-bottom: 20px;">
      <div style="background-color: #e9ecef; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; color: #555;">
        <p style="margin: 0 0 5px 0;"><strong>【入力フォーマット】</strong></p>
        <p v-if="gradeMode === 'none'" style="margin: 0;">名前 性別 タグ1 タグ2... (スペース区切り)</p>
        <p v-else style="margin: 0;">名前 学年 性別 タグ1 タグ2... (スペース区切り)<br>例: <code>SH 3 男 幹事 喫煙者</code></p>
      </div>
      <textarea v-model="bulkText" rows="6" :placeholder="gradeMode === 'none' ? 'あ 男 幹事\nい 女' : 'あ 3 男 幹事\nい B4 女 早起き\nう M1 男'" style="width: 100%; box-sizing: border-box; padding: 10px; font-size: 14px; border: 1px solid #aaa; border-radius: 4px; margin-bottom: 10px; resize: vertical;"></textarea>
      <div style="text-align: right;"><button @click="handleBulkAdd" style="padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">🚀 まとめて登録する</button></div>
    </div>

    <div v-if="hasMixedGrades" style="background-color: #fff3cd; color: #856404; padding: 12px; border: 1px solid #ffeeba; border-radius: 4px; margin-bottom: 15px; font-size: 14px;">
      ⚠️ <strong>注意:</strong> 「3年」のような数字と「M1」のような文字が混ざっています。
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0;">
      <li v-for="m in members" :key="m.id" style="display: flex; justify-content: space-between; background-color: white; padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px; align-items: center;">
        <div>
          <span style="font-size: 16px; font-weight: bold;">{{ m.name }}</span>
          <span v-if="gradeMode === 'none'" style="color: #666; font-size: 14px; margin-left: 10px;">({{ m.gender === 'male' ? '男性' : '女性' }})</span>
          <span v-else style="color: #666; font-size: 14px; margin-left: 10px;">({{ formatGrade(m.grade) }} / {{ m.gender === 'male' ? '男性' : '女性' }})</span>
          <span v-for="tag in m.tags" :key="tag" style="margin-left: 8px; background-color: #17a2b8; color: white; padding: 2px 6px; border-radius: 12px; font-size: 12px;">{{ tag }}</span>
        </div>
        <button @click="emit('remove', m.id)" style="background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 5px 10px;">削除</button>
      </li>
    </ul>
    <p v-if="members.length === 0" style="color: #777; font-size: 14px; text-align: center;">メンバーが登録されていません。</p>
  </div>
</template>