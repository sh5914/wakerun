<script setup lang="ts">
import { ref } from 'vue';
import type { Room } from '../types';

// 親(App.vue)から部屋リストを受け取る
const props = defineProps<{
  rooms: Room[]
}>();

// 親(App.vue)に合図を送る準備
const emit = defineEmits<{
  (e: 'add', room: Room): void;
  (e: 'remove', id: string): void;
}>();

// 画面の入力欄と連動する変数
const inputName = ref('');
const inputCapacity = ref<number>(3); // デフォルトは3人部屋にしておく

const handleAdd = () => {
  if (inputName.value.trim() === '') return;
  if (inputCapacity.value <= 0) return; // 定員が0以下の場合は弾く

  const newRoom: Room = {
    id: 'r_' + Date.now(),
    name: inputName.value,
    capacity: inputCapacity.value
  };

  emit('add', newRoom);
  
  // 次の部屋を入力しやすくするため、名前だけリセット（定員はそのまま残す）
  inputName.value = '';
};
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; background-color: #fafafa;">
    <h2 style="margin-top: 0;">🏠 部屋設定</h2>
    
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
      <input 
        v-model="inputName" 
        type="text" 
        placeholder="部屋名 (例: 101号室)" 
        style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px; flex-grow: 1; max-width: 200px;"
        @keypress.enter="handleAdd" 
      />
      
      <div style="display: flex; align-items: center; gap: 5px;">
        <input 
          v-model="inputCapacity" 
          type="number" 
          min="1"
          style="padding: 8px; font-size: 16px; border: 1px solid #aaa; border-radius: 4px; width: 60px; text-align: center;"
          @keypress.enter="handleAdd" 
        />
        <span>人部屋</span>
      </div>

      <button 
        @click="handleAdd" 
        style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;"
      >
        ＋ 追加
      </button>
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0;">
      <li 
        v-for="room in rooms" 
        :key="room.id"
        style="display: flex; justify-content: space-between; background-color: white; padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px; align-items: center;"
      >
        <span>
          <strong>{{ room.name }}</strong> 
          <span style="color: #555; margin-left: 10px;">(定員: {{ room.capacity }}人)</span>
        </span>
        <button 
          @click="emit('remove', room.id)" 
          style="background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 4px 10px;"
        >
          削除
        </button>
      </li>
    </ul>
    
    <p v-if="rooms.length === 0" style="color: #777; font-size: 14px;">
      部屋が登録されていません。
    </p>
  </div>
</template>