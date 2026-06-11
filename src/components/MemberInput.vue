<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Member, GradeMode } from '../types';

const props = defineProps<{ members: Member[]; gradeMode: GradeMode; }>();
const emit = defineEmits<{ 
  (e: 'add', member: Member): void; 
  (e: 'remove', id: string): void;
  (e: 'update', member: Member): void;
}>();

const inputName = ref('');
const selectedGrade = ref<string | number>('3');
const selectedGender = ref<'male' | 'female'>('male');
const inputTags = ref('');

const isBulkMode = ref(false);
const bulkText = ref('');

const editId = ref<string | null>(null);
const editName = ref('');
const editGrade = ref<string | number>('3');
const editGender = ref<'male' | 'female'>('male');
const editTags = ref('');

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

const existingTags = computed(() => {
  const tags = new Set<string>();
  props.members.forEach(m => m.tags?.forEach(t => tags.add(t)));
  return Array.from(tags);
});

const appendTag = (tag: string) => {
  const currentTags = inputTags.value.split(/[,\s]+/).filter(t => t);
  if (!currentTags.includes(tag)) {
    inputTags.value = inputTags.value ? `${inputTags.value} ${tag}` : tag;
  }
};

const handleAdd = () => {
  if (!inputName.value) return;
  const tags = inputTags.value.split(/[,\s]+/).map(t => t.trim()).filter(t => t);

  emit('add', {
    id: 'm_' + Date.now(),
    name: inputName.value,
    grade: props.gradeMode === 'none' ? 'none' : selectedGrade.value,
    gender: selectedGender.value,
    tags: tags
  });
  inputName.value = '';
  inputTags.value = '';
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
      if (parts.length >= 3) tags = parts.slice(2);
    } else {
      if (parts.length >= 2) grade = parts[1];
      if (parts.length >= 3) {
        const gStr = parts[2].toLowerCase();
        if (gStr.includes('女') || gStr === 'f' || gStr === 'female') gender = 'female';
      }
      if (parts.length >= 4) tags = parts.slice(3);
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

const startEdit = (m: Member) => {
  editId.value = m.id;
  editName.value = m.name;
  editGrade.value = m.grade === 'none' ? '3' : m.grade;
  editGender.value = m.gender;
  editTags.value = m.tags ? m.tags.join(' ') : '';
};

const saveEdit = () => {
  if (!editId.value || !editName.value) return;
  emit('update', {
    id: editId.value,
    name: editName.value,
    grade: props.gradeMode === 'none' ? 'none' : editGrade.value,
    gender: editGender.value,
    tags: editTags.value.split(/[,\s]+/).map(t => t.trim()).filter(t => t)
  });
  editId.value = null; 
};

const cancelEdit = () => {
  editId.value = null;
};

const formatGrade = (grade: string | number) => isNaN(Number(grade)) ? String(grade) : `${grade}年`;
</script>

<template>
  <div style="border: 1px solid #e0e0e0; padding: 25px; margin-bottom: 20px; border-radius: 12px; background-color: #f5f7fa; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <h2 style="margin: 0; font-size: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px; color: #333;">👤</span> メンバー設定
      </h2>
      
      <button 
        @click="isBulkMode = !isBulkMode" 
        style="padding: 8px 16px; background-color: #607d8b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; transition: background-color 0.2s;"
      >
        {{ isBulkMode ? '✏️ 手動入力に戻す' : '📝 一括登録（コピペ）' }}
      </button>
    </div>
    
    <div v-if="!isBulkMode" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; align-items: center;">
        <input 
          v-model="inputName" 
          placeholder="名前" 
          style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; flex: 1; min-width: 150px; background-color: white;"
          @keyup.enter="handleAdd"
        />
        
        <select v-if="gradeMode !== 'none'" v-model="selectedGrade" style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white;">
          <template v-if="gradeMode === 'normal'">
            <option value="1">1年</option><option value="2">2年</option><option value="3">3年</option><option value="4">4年</option><option value="5">5年</option><option value="6">6年</option>
          </template>
          <template v-if="gradeMode === 'univ'">
            <option value="B1">学部1年 (B1)</option><option value="B2">学部2年 (B2)</option><option value="B3">学部3年 (B3)</option><option value="B4">学部4年 (B4)</option><option value="M1">修士1年 (M1)</option><option value="M2">修士2年 (M2)</option>
            <option value="D1">博士1年 (D1)</option><option value="D2">博士2年 (D2)</option><option value="D3">博士3年 (D3)</option>
            <option value="OB">OB / OG</option>
          </template>
        </select>

        <select v-model="selectedGender" style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; background-color: white;">
          <option value="male">男性</option><option value="female">女性</option>
        </select>

        <input 
          v-model="inputTags" 
          placeholder="タグ (任意)" 
          style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; flex: 1; min-width: 150px; background-color: white;"
          @keyup.enter="handleAdd"
        />

        <button 
          @click="handleAdd" 
          style="padding: 10px 24px; background-color: #1e88e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; transition: background-color 0.2s;"
        >
          ＋ 追加
        </button>
      </div>

      <div v-if="existingTags.length > 0" style="padding-left: 5px;">
        <span style="font-size: 13px; color: #777; margin-right: 8px;">よく使うタグ:</span>
        <button 
          v-for="tag in existingTags" 
          :key="tag" 
          @click="appendTag(tag)"
          style="background-color: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 5px 12px; border-radius: 20px; font-size: 13px; margin-right: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s;"
        >
          ＋ {{ tag }}
        </button>
      </div>
    </div>

    <div v-else style="margin-bottom: 25px;">
      <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; color: #555; border-left: 4px solid #adb5bd;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">【入力フォーマット】</p>
        <p v-if="gradeMode === 'none'" style="margin: 0;">名前 性別 タグ1 タグ2... (スペース、カンマ、タブ区切り)</p>
        <p v-else style="margin: 0;">名前 学年 性別 タグ1 タグ2... (スペース、カンマ、タブ区切り)<br>例: <code>SH 3 男 幹事 喫煙者</code> または <code>YY D1 女</code></p>
      </div>
      
      <textarea 
        v-model="bulkText" 
        rows="8"
        :placeholder="gradeMode === 'none' ? 'あ 男 幹事\nい 女\nう 男' : 'あ 3 男 幹事\nい B4 女 早起き\nう M1 男'"
        style="width: 100%; box-sizing: border-box; padding: 12px; font-size: 15px; border: 1px solid #ccd0d5; border-radius: 8px; margin-bottom: 15px; resize: vertical; background-color: white;"
      ></textarea>
      
      <div style="text-align: right;">
        <button 
          @click="handleBulkAdd" 
          style="padding: 10px 24px; background-color: #1e88e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; transition: background-color 0.2s;"
        >
          🚀 まとめて登録する
        </button>
      </div>
    </div>

    <div v-if="hasMixedGrades" style="background-color: #fff3cd; color: #856404; padding: 12px; border: 1px solid #ffeeba; border-radius: 6px; margin-bottom: 20px; font-size: 14px;">
      ⚠️ <strong>注意:</strong> 「3年」のような数字表記と、「M1」のような文字表記が混ざっています。
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
      <li 
        v-for="m in members" 
        :key="m.id" 
        style="display: flex; justify-content: space-between; background-color: white; padding: 12px 15px; border: 1px solid #eee; border-radius: 8px; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);"
      >
        <div v-if="editId !== m.id" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="font-size: 16px; font-weight: bold; color: #333;">
              {{ m.name }}
            </span>
            <span v-if="gradeMode === 'none'" style="color: #666; font-size: 14px;">
              ({{ m.gender === 'male' ? '男性' : '女性' }})
            </span>
            <span v-else style="color: #666; font-size: 14px;">
              ({{ formatGrade(m.grade) }} / {{ m.gender === 'male' ? '男性' : '女性' }})
            </span>
            <span v-for="tag in m.tags" :key="tag" style="background-color: #e0f2f1; color: #00796b; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; border: 1px solid #b2dfdb;">
              {{ tag }}
            </span>
          </div>
          <div style="display: flex; gap: 5px;">
            <button 
              @click="startEdit(m)" 
              style="background-color: #ffc107; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-size: 13px; font-weight: bold; transition: background-color 0.2s;"
            >
              編集
            </button>
            <button 
              @click="emit('remove', m.id)" 
              style="background-color: #ef5350; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-size: 13px; font-weight: bold; transition: background-color 0.2s;"
            >
              削除
            </button>
          </div>
        </div>

        <div v-else style="display: flex; gap: 8px; flex-wrap: wrap; background-color: #fff8e1; padding: 10px; border-radius: 8px; align-items: center; width: 100%; border: 1px solid #ffe082;">
          <input v-model="editName" style="padding: 6px; font-size: 14px; border: 1px solid #ccd0d5; border-radius: 4px; flex: 1; min-width: 100px;" />
          
          <select v-if="gradeMode !== 'none'" v-model="editGrade" style="padding: 6px; font-size: 14px; border: 1px solid #ccd0d5; border-radius: 4px;">
            <template v-if="gradeMode === 'normal'">
              <option value="1">1年</option><option value="2">2年</option><option value="3">3年</option><option value="4">4年</option><option value="5">5年</option><option value="6">6年</option>
            </template>
            <template v-if="gradeMode === 'univ'">
              <option value="B1">B1</option><option value="B2">B2</option><option value="B3">B3</option><option value="B4">B4</option><option value="M1">M1</option><option value="M2">M2</option>
              <option value="D1">D1</option><option value="D2">D2</option><option value="D3">D3</option>
              <option value="OB">OB</option>
            </template>
          </select>
          
          <select v-model="editGender" style="padding: 6px; font-size: 14px; border: 1px solid #ccd0d5; border-radius: 4px;">
            <option value="male">男性</option><option value="female">女性</option>
          </select>
          
          <input v-model="editTags" placeholder="タグ" style="padding: 6px; font-size: 14px; border: 1px solid #ccd0d5; border-radius: 4px; flex: 1; min-width: 100px;" />
          
          <div style="display: flex; gap: 5px;">
            <button @click="saveEdit" style="background-color: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-weight: bold;">保存</button>
            <button @click="cancelEdit" style="background-color: #9e9e9e; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px;">取消</button>
          </div>
        </div>

      </li>
    </ul>

    <p v-if="members.length === 0" style="color: #888; font-size: 15px; text-align: center; margin: 30px 0;">
      メンバーが登録されていません。<br>上のフォームから追加するか、一括登録を試してください。
    </p>
  </div>
</template>