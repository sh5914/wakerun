<script setup lang="ts">
import { ref, watch } from 'vue'; // ★ データの変更を監視するために 'watch' を追加
import type { Member, Room, Constraint, AssignResult, GradeMode } from './types';
import { solveAssignments } from './logic/solver';

import MemberInput from './components/MemberInput.vue';
import RoomInput from './components/RoomInput.vue';
import ConstraintInput from './components/ConstraintInput.vue';
import ResultDisplay from './components/ResultDisplay.vue';

// --- データの箱（ブラウザの localStorage から読み込むように進化！） ---
// 保存されているデータがあればそれを使い、なければ空の配列（[]）を初期値にします
const members = ref<Member[]>(
  JSON.parse(localStorage.getItem('wakerun_members') || '[]')
);
const rooms = ref<Room[]>(
  JSON.parse(localStorage.getItem('wakerun_rooms') || '[]')
);
const constraints = ref<Constraint[]>(
  JSON.parse(localStorage.getItem('wakerun_constraints') || '[]')
);
const gradeMode = ref<GradeMode>(
  (localStorage.getItem('wakerun_gradeMode') as GradeMode) || 'normal'
);


const result = ref<AssignResult | null>(null);
const errorMessage = ref<string>('');

// --- ⚙️ 自動保存の仕組み（watch） ---
// members や rooms の中身が変わるたびに、自動的にブラウザに保存（文字列化して保存）します
watch(members, (newVal) => {
  localStorage.setItem('wakerun_members', JSON.stringify(newVal));
}, { deep: true }); // { deep: true } をつけることで、配列の中身の変更までしっかり監視します

watch(rooms, (newVal) => {
  localStorage.setItem('wakerun_rooms', JSON.stringify(newVal));
}, { deep: true });

watch(constraints, (newVal) => {
  localStorage.setItem('wakerun_constraints', JSON.stringify(newVal));
}, { deep: true });

watch(gradeMode, (newVal) => {
  localStorage.setItem('wakerun_gradeMode', newVal);
});


// --- 追加・削除の処理（ここは変更なし） ---
const handleAddMember = (m: Member) => members.value.push(m);
const handleRemoveMember = (id: string) => members.value = members.value.filter(m => m.id !== id);

const handleAddRoom = (r: Room) => rooms.value.push(r);
const handleRemoveRoom = (id: string) => rooms.value = rooms.value.filter(r => r.id !== id);

const handleAddConstraint = (c: Constraint) => constraints.value.push(c);
const handleRemoveConstraint = (id: string) => constraints.value = constraints.value.filter(c => c.id !== id);

const handleUpdateMember = (updatedMember: Member) => {
  const index = members.value.findIndex(m => m.id === updatedMember.id);
  if (index !== -1) members.value[index] = updatedMember;
};

const handleUpdateRoom = (updatedRoom: Room) => {
  const index = rooms.value.findIndex(r => r.id === updatedRoom.id);
  if (index !== -1) rooms.value[index] = updatedRoom;
};

// --- ガチャを回す処理（ここは変更なし） ---
const runSolver = () => {
  errorMessage.value = ''; 
  result.value = null;
  try {
    result.value = solveAssignments(members.value, rooms.value, constraints.value);
  } catch (error: any) {
    errorMessage.value = error.message;
  }
};
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto; font-family: sans-serif; padding: 20px;">
    <h1 style="text-align: center;">わけるん</h1>
    <p style="text-align: center;">自動部屋割り最適化ツール</p>


    <div style="border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 20px; border-radius: 8px; background-color: #f8f9fa;">
      <h3 style="margin-top: 0; font-size: 16px;">⚙️ 基本設定</h3>
      <label style="font-weight: bold; margin-right: 10px;">学年の入力:</label>
      <select v-model="gradeMode" style="padding: 8px; font-size: 14px; border-radius: 4px; border: 1px solid #aaa;">
        <option value="none">使用しない（社会人・友人グループなど）</option>
        <option value="normal">一般表記（1年、2年...）</option>
        <option value="univ">大学・大学院表記（B1、M1...）</option>
      </select>
    </div>

    <MemberInput 
      :members="members" 
      :grade-mode="gradeMode"
      @add="handleAddMember" 
      @remove="handleRemoveMember" 
      @update="handleUpdateMember" 
    />

    <RoomInput 
      :rooms="rooms" 
      @add="handleAddRoom" 
      @remove="handleRemoveRoom" 
    />

    <ConstraintInput 
      :constraints="constraints" 
      :members="members"
      :grade-mode="gradeMode"
      @add="handleAddConstraint" 
      @remove="handleRemoveConstraint" 
      @update="handleUpdateRoom" 
    />

    <p v-if="errorMessage" style="color: red; font-weight: bold; text-align: center;">
      エラー: {{ errorMessage }}
    </p>

    <div style="text-align: center; margin: 20px 0;">
      <button 
        @click="runSolver"
        style="padding: 15px 30px; font-size: 18px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 8px; font-weight: bold;"
      >
        🎲 部屋割りを計算する！
      </button>
    </div>

    <ResultDisplay 
      :result="result" 
      :rooms="rooms" 
      :grade-mode="gradeMode"
    />
  </div>
</template>