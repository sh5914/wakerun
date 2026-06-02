<script setup lang="ts">
import { ref } from 'vue';
import type { AssignResult, Room } from '../types';

const props = defineProps<{
  result: AssignResult | null;
  rooms: Room[];
}>();

const isCopied = ref(false);

const copyToClipboard = async () => {
  if (!props.result) return;


  let text = '部屋割り結果\n\n';

  for (const [roomId, members] of Object.entries(props.result.roomAssignments)) {
    const roomName = props.rooms.find(r => r.id === roomId)?.name || '未知の部屋';

    text += `【${roomName}】\n`;
    
    for (const m of members) {
      const genderStr = m.gender === 'male' ? '男' : '女';
      text += `・${m.name} (${m.grade}年/${genderStr})\n`;
    }
    text += '\n'; 
  }

  // 余分な最後の改行を取り除く
  text = text.trim();

  try {
    await navigator.clipboard.writeText(text);
    
    isCopied.value = true;
    
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
    
  } catch (err) {
    alert('コピーに失敗しました。お使いのブラウザが対応していない可能性があります。');
  }
};
</script>

<template>
  <div v-if="result" style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
      <h2 style="margin: 0;">🎉 計算結果</h2>
      
      <button 
        @click="copyToClipboard"
        :style="{ 
          padding: '10px 20px', 
          backgroundColor: isCopied ? '#28a745' : '#00b900', /* 初期色はLINE風のグリーン */
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s'
        }"
      >
        {{ isCopied ? '✅ コピーしました！' : 'コピー' }}
      </button>
    </div>

    <p style="text-align: center; font-size: 16px; margin-top: 0;">
      <strong>合計ペナルティ点:</strong> 
      <span :style="{ color: result.totalPenalty === 0 ? '#5cb85c' : '#d9534f', fontWeight: 'bold' }">
        {{ result.totalPenalty }} 点
      </span>
    </p>

    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
      <div 
        v-for="(members, roomId) in result.roomAssignments" 
        :key="roomId" 
        style="border: 1px solid #ccc; background-color: white; padding: 15px; min-width: 180px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"
      >
        <h3 style="margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 5px; color: #333;">
          {{ rooms.find(r => r.id === roomId)?.name || '未知の部屋' }}
        </h3>
        
        <ul style="padding-left: 20px; margin: 0;">
          <li v-for="m in members" :key="m.id" style="margin-bottom: 5px; font-size: 15px;">
            <strong>{{ m.name }}</strong>
            <span style="color: #666; font-size: 12px; margin-left: 5px;">
              ({{ m.grade }}年/{{ m.gender === 'male' ? '男' : '女' }})
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="result.ignoredConstraints.length > 0" style="margin-top: 25px; padding: 10px; background-color: #fdf7f7; border-left: 4px solid #d9534f; border-radius: 4px;">
      <h4 style="margin-top: 0; color: #d9534f;">⚠️ 妥協した（満たせなかった）条件</h4>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li v-for="c in result.ignoredConstraints" :key="c.id">
          条件タイプ: {{ c.type }} (優先度: {{ c.priority }})
        </li>
      </ul>
    </div>
    <div v-else style="margin-top: 25px; color: #5cb85c; font-weight: bold; text-align: center; font-size: 16px;">
      すべての条件を完全にクリアしました！
    </div>
  </div>
</template>