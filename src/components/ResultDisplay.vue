<script setup lang="ts">
import type { AssignResult, Room } from '../types';

// 親(App.vue)から「計算結果」と「部屋の一覧」を受け取る
defineProps<{
  result: AssignResult | null;
  rooms: Room[];
}>();
</script>

<template>
  <div v-if="result" style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="margin-top: 0; text-align: center;">🎉 計算結果</h2>
    <p style="text-align: center; font-size: 16px;">
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
      ✨ すべての条件を完全にクリアしました！
    </div>
  </div>
</template>