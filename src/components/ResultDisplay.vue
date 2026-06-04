<script setup lang="ts">
import { ref } from 'vue';
import type { AssignResult, Room, GradeMode } from '../types';

const props = defineProps<{ result: AssignResult | null; rooms: Room[]; gradeMode: GradeMode; }>();
const isCopied = ref(false);

const formatGrade = (grade: string | number) => isNaN(Number(grade)) ? String(grade) : `${grade}年`;

const copyToClipboard = async () => {
  if (!props.result) return;
  let text = '部屋割り結果\n\n';

  for (const [roomId, members] of Object.entries(props.result.roomAssignments)) {
    const roomName = props.rooms.find(r => r.id === roomId)?.name || '未知の部屋';
    text += `【${roomName}】\n`;
    
    for (const m of members) {
      const genderStr = m.gender === 'male' ? '男' : '女';
      // ✨ LINEのテキストにもタグ情報を付与
      const tagStr = m.tags && m.tags.length > 0 ? ` [${m.tags.join(', ')}]` : '';
      
      if (props.gradeMode === 'none') {
        text += `・${m.name} (${genderStr})${tagStr}\n`;
      } else {
        const gradeStr = isNaN(Number(m.grade)) ? String(m.grade) : `${m.grade}年`;
        text += `・${m.name} (${gradeStr}/${genderStr})${tagStr}\n`;
      }
    }
    text += '\n'; 
  }
  text = text.trim();

  try {
    await navigator.clipboard.writeText(text);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  } catch (err) {
    alert('コピーに失敗しました。');
  }
};
</script>

<template>
  <div v-if="result" style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
      <h2 style="margin: 0;">🎉 計算結果</h2>
      <button @click="copyToClipboard" :style="{ padding: '10px 20px', backgroundColor: isCopied ? '#28a745' : '#00b900', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }">
        {{ isCopied ? '✅ コピーしました！' : '📋 LINEに共有 (コピー)' }}
      </button>
    </div>

    <p style="text-align: center; font-size: 16px; margin-top: 0;">
      <strong>合計ペナルティ点:</strong> 
      <span :style="{ color: result.totalPenalty === 0 ? '#5cb85c' : '#d9534f', fontWeight: 'bold' }">
        {{ result.totalPenalty }} 点
      </span>
    </p>

    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
      <div v-for="(members, roomId) in result.roomAssignments" :key="roomId" style="border: 1px solid #ccc; background-color: white; padding: 15px; min-width: 180px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 5px; color: #333;">
          {{ rooms.find(r => r.id === roomId)?.name || '未知の部屋' }}
        </h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li v-for="m in members" :key="m.id" style="margin-bottom: 5px; font-size: 15px;">
            <strong>{{ m.name }}</strong>
            <span v-if="gradeMode === 'none'" style="color: #666; font-size: 12px; margin-left: 5px;">({{ m.gender === 'male' ? '男' : '女' }})</span>
            <span v-else style="color: #666; font-size: 12px; margin-left: 5px;">({{ formatGrade(m.grade) }}/{{ m.gender === 'male' ? '男' : '女' }})</span>
            <span v-for="tag in m.tags" :key="tag" style="margin-left: 5px; background-color: #17a2b8; color: white; padding: 2px 5px; border-radius: 10px; font-size: 11px;">{{ tag }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>