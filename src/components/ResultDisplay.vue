<script setup lang="ts">
import { ref } from 'vue';
import type { AssignResult, Room, GradeMode, Member, Constraint } from '../types';

const props = defineProps<{ 
  result: AssignResult | null; 
  rooms: Room[]; 
  gradeMode: GradeMode; 
  members: Member[]; 
}>();

const isCopied = ref(false);

const formatGrade = (grade: string | number) => isNaN(Number(grade)) ? String(grade) : `${grade}年`;

const getConstraintLabel = (c: Constraint) => {
  switch (c.type) {
    case 'gender_separate': return '男女を分ける';
    case 'grade_grouped': return '学年が固まるようにする';
    case 'grade_even': return '学年が均等になるようにする';
    case 'pair': {
      const m1 = props.members.find(m => m.id === c.targetIds?.[0])?.name || '不明';
      const m2 = props.members.find(m => m.id === c.targetIds?.[1])?.name || '不明';
      return `特定のペアを同室にする [ ${m1} & ${m2} ]`;
    }
    case 'separate': {
      const m1 = props.members.find(m => m.id === c.targetIds?.[0])?.name || '不明';
      const m2 = props.members.find(m => m.id === c.targetIds?.[1])?.name || '不明';
      return `特定のペアを別室にする [ ${m1} & ${m2} ]`;
    }
    case 'tag_grouped': return `タグ【${c.targetTag}】を同室に集める`;
    case 'tag_separate': return `タグ【${c.targetTag}】を別室に分散させる`;
    default: return '不明な条件';
  }
};

const copyToClipboard = async () => {
  if (!props.result) return;
  let text = '部屋割り結果\n\n';

  for (const [roomId, membersInRoom] of Object.entries(props.result.roomAssignments)) {
    const roomName = props.rooms.find(r => r.id === roomId)?.name || '未知の部屋';
    text += `【${roomName}】\n`;
    
    for (const m of membersInRoom) {
      const genderStr = m.gender === 'male' ? '男' : '女';
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
  <div v-if="result" style="margin-top: 20px; padding: 25px; background-color: #f5f7fa; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <h2 style="margin: 0; font-size: 20px; color: #333;">
        計算結果
      </h2>
      
      <button 
        @click="copyToClipboard" 
        :style="{ padding: '10px 24px', backgroundColor: isCopied ? '#4caf50' : '#1e88e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background-color 0.2s' }"
      >
        {{ isCopied ? '✅ コピーしました！' : '📋 共有 (コピー)' }}
      </button>
    </div>

    <div v-if="result.ignoredConstraints && result.ignoredConstraints.length > 0" style="background-color: #fff3cd; color: #856404; padding: 15px; border: 1px solid #ffeeba; border-radius: 8px; margin-bottom: 20px; text-align: left;">
      <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 15px; font-weight: bold; display: flex; align-items: center; gap: 5px;">
        ⚠️ 以下の条件は達成できませんでした
      </h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li v-for="c in result.ignoredConstraints" :key="c.id" style="font-size: 14px; margin-bottom: 5px;">
          {{ getConstraintLabel(c) }}
          <span style="color: #d9534f; font-weight: bold; margin-left: 5px; font-size: 12px;">(優先度: {{ c.priority }})</span>
        </li>
      </ul>
    </div>

    <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
      <div v-for="(membersInRoom, roomId) in result.roomAssignments" :key="roomId" style="border: 1px solid #ccd0d5; background-color: white; padding: 15px; min-width: 200px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; border-bottom: 2px solid #1e88e5; padding-bottom: 8px; color: #333; font-size: 18px;">
          {{ rooms.find(r => r.id === roomId)?.name || '未知の部屋' }}
        </h3>
        
        <ul style="padding-left: 0; margin: 0; list-style-type: none;">
          <li v-for="m in membersInRoom" :key="m.id" style="margin-bottom: 10px; font-size: 15px; display: flex; flex-direction: column; align-items: center;">
            <div>
              <strong style="color: #333; font-size: 16px;">{{ m.name }}</strong>
              <span v-if="gradeMode === 'none'" style="color: #666; font-size: 13px; margin-left: 5px;">({{ m.gender === 'male' ? '男' : '女' }})</span>
              <span v-else style="color: #666; font-size: 13px; margin-left: 5px;">({{ formatGrade(m.grade) }}/{{ m.gender === 'male' ? '男' : '女' }})</span>
            </div>
            
            <div v-if="m.tags && m.tags.length > 0" style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
              <span v-for="tag in m.tags" :key="tag" style="background-color: #e0f2f1; color: #00796b; padding: 2px 6px; border-radius: 12px; font-size: 11px; font-weight: bold; border: 1px solid #b2dfdb;">
                {{ tag }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>