<script setup lang="ts">
import { ref } from 'vue';
import type { Member } from '../types';

const props = defineProps<{ members: Member[] }>();
const emit = defineEmits<{
  (e: 'add', member: Member): void;
  (e: 'remove', id: string): void;
}>();

// 画面の入力欄と連動する変数
const inputName = ref('');
const inputGrade = ref<number>(3); // デフォルトは3年生
const inputGender = ref<'male' | 'female'>('male'); // デフォルトは男性

const handleAdd = () => {
  if (inputName.value.trim() === '') return;

  const newMember: Member = {
    id: 'm_' + Date.now(),
    name: inputName.value,
    gender: inputGender.value,
    grade: inputGrade.value,
    attributes: { snoring: false } // いびきは裏側で無効化しておく
  };

  emit('add', newMember);
  
  // 名前だけリセット（学年と性別はキープすると連続入力がラクです）
  inputName.value = '';
};
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #fafafa;">
    <h2 style="margin-top: 0;">👤 メンバー設定</h2>
    
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
      <input 
        v-model="inputName" 
        type="text" 
        placeholder="名前 (例: SH)" 
        style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px; flex-grow: 1; max-width: 180px;"
        @keypress.enter="handleAdd" 
      />
      
      <select v-model="inputGrade" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
        <option :value="1">1年</option>
        <option :value="2">2年</option>
        <option :value="3">3年</option>
        <option :value="4">4年</option>
        <option :value="5">5年</option>
      </select>

      <select v-model="inputGender" style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px;">
        <option value="male">男性</option>
        <option value="female">女性</option>
      </select>

      <button 
        @click="handleAdd" 
        style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"
      >
        ＋ 追加
      </button>
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0;">
      <li 
        v-for="member in members" 
        :key="member.id"
        style="display: flex; justify-content: space-between; background-color: white; padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px; align-items: center;"
      >
        <span>
          <strong>{{ member.name }}</strong> 
          <span style="color: #666; font-size: 14px; margin-left: 10px;">
            ({{ member.grade }}年 / {{ member.gender === 'male' ? '男性' : '女性' }})
          </span>
        </span>
        <button 
          @click="emit('remove', member.id)" 
          style="background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 4px 10px;"
        >
          削除
        </button>
      </li>
    </ul>
    
    <p v-if="members.length === 0" style="color: #777; font-size: 14px;">
      メンバーが登録されていません。
    </p>
  </div>
</template>