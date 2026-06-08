<script setup lang="ts">
import { ref } from 'vue';
import type { Room } from '../types';

const props = defineProps<{ rooms: Room[] }>();
const emit = defineEmits<{ 
  (e: 'add', room: Room): void; 
  (e: 'remove', id: string): void;
  (e: 'update', room: Room): void; // ✨ update ロジックを維持
}>();

const inputRoomName = ref('');
const inputCapacity = ref<number>(4);

// ✨ 編集モード用の状態管理（維持）
const editId = ref<string | null>(null);
const editName = ref('');
const editCapacity = ref<number>(1);

const handleAdd = () => {
  if (!inputRoomName.value) return;
  emit('add', {
    id: 'r_' + Date.now(),
    name: inputRoomName.value,
    capacity: inputCapacity.value,
  });
  inputRoomName.value = '';
};

// ✨ 編集開始時の処理（維持）
const startEdit = (r: Room) => {
  editId.value = r.id;
  editName.value = r.name;
  editCapacity.value = r.capacity;
};

// ✨ 編集保存時の処理（維持）
const saveEdit = () => {
  if (!editId.value || !editName.value) return;
  emit('update', {
    id: editId.value,
    name: editName.value,
    capacity: editCapacity.value
  });
  editId.value = null;
};

const cancelEdit = () => {
  editId.value = null;
};
</script>

<template>
  <div style="border: 1px solid #e0e0e0; padding: 25px; margin-bottom: 20px; border-radius: 12px; background-color: #f5f7fa; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="margin-top: 0; text-align: center; font-size: 20px; color: #333; display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span style="font-size: 24px;">🏠</span> 部屋設定
    </h2>
    
    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 25px; flex-wrap: wrap; align-items: center;">
      <input 
        v-model="inputRoomName" 
        placeholder="部屋名 (例: 101号室)" 
        style="padding: 10px; font-size: 16px; border: 1px solid #ccd0d5; border-radius: 6px; flex: 1; min-width: 200px; background-color: white;"
        @keyup.enter="handleAdd"
      />
      
      <div style="display: flex; align-items: center; background-color: white; border: 1px solid #ccd0d5; border-radius: 6px; padding: 0 10px;">
        <label style="font-size: 14px; margin-right: 5px; color: #666;">定員:</label>
        <input 
          v-model.number="inputCapacity" 
          type="number" 
          min="1" 
          style="padding: 10px 5px; font-size: 16px; border: none; outline: none; width: 60px; text-align: center;"
          @keyup.enter="handleAdd"
        />
        <span style="font-size: 14px; color: #666;">名</span>
      </div>

      <button 
        @click="handleAdd" 
        style="padding: 10px 24px; background-color: #1e88e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; transition: background-color 0.2s;"
      >
        ＋ 追加
      </button>
    </div>

    <ul style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
      <li 
        v-for="r in rooms" 
        :key="r.id" 
        style="background-color: white; padding: 12px 15px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);"
      >
        
        <div v-if="editId !== r.id" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 16px; font-weight: bold; color: #333;">
            {{ r.name }} 
            <span style="color: #666; font-size: 14px; font-weight: normal; margin-left: 15px;">
              定員: <strong>{{ r.capacity }}</strong> 名
            </span>
          </span>
          <div style="display: flex; gap: 5px;">
            <button 
              @click="startEdit(r)" 
              style="background-color: #ffc107; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-size: 13px; font-weight: bold; transition: background-color 0.2s;"
            >
              編集
            </button>
            <button 
              @click="emit('remove', r.id)" 
              style="background-color: #ef5350; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-size: 13px; font-weight: bold; transition: background-color 0.2s;"
            >
              削除
            </button>
          </div>
        </div>

        <div v-else style="display: flex; gap: 8px; flex-wrap: wrap; background-color: #fff8e1; padding: 10px; border-radius: 8px; align-items: center; width: 100%; border: 1px solid #ffe082;">
          <input v-model="editName" style="padding: 6px; font-size: 14px; border: 1px solid #ccd0d5; border-radius: 4px; flex: 1; min-width: 150px;" />
          
          <div style="display: flex; align-items: center; background-color: white; border: 1px solid #ccd0d5; border-radius: 6px; padding: 0 5px;">
            <input v-model.number="editCapacity" type="number" min="1" style="padding: 6px 5px; font-size: 14px; border: none; outline: none; width: 50px; text-align: center;" />
            <span style="font-size: 14px; color: #666;">名</span>
          </div>
          
          <div style="display: flex; gap: 5px;">
            <button @click="saveEdit" style="background-color: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px; font-weight: bold;">保存</button>
            <button @click="cancelEdit" style="background-color: #9e9e9e; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 12px;">取消</button>
          </div>
        </div>

      </li>
    </ul>
    
    <p v-if="rooms.length === 0" style="color: #888; font-size: 15px; text-align: center; margin: 30px 0;">
      部屋が登録されていません。<br>上のフォームから追加してください。
    </p>
  </div>
</template>