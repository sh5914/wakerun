<script setup lang="ts">
import { ref, watch } from 'vue'; // ★ データの変更を監視するために 'watch' を追加
import type { Member, Room, Constraint, AssignResult } from './types';
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


// --- 追加・削除の処理（ここは変更なし） ---
const handleAddMember = (m: Member) => members.value.push(m);
const handleRemoveMember = (id: string) => members.value = members.value.filter(m => m.id !== id);

const handleAddRoom = (r: Room) => rooms.value.push(r);
const handleRemoveRoom = (id: string) => rooms.value = rooms.value.filter(r => r.id !== id);

const handleAddConstraint = (c: Constraint) => constraints.value.push(c);
const handleRemoveConstraint = (id: string) => constraints.value = constraints.value.filter(c => c.id !== id);

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
    <h1 style="text-align: center;">🧩 わけるん</h1>
    <p style="text-align: center;">自動部屋割り最適化ツール</p>

    <MemberInput 
      :members="members" 
      @add="handleAddMember" 
      @remove="handleRemoveMember" 
    />

    <RoomInput 
      :rooms="rooms" 
      @add="handleAddRoom" 
      @remove="handleRemoveRoom" 
    />

    <ConstraintInput 
      :constraints="constraints" 
      :members="members"
      @add="handleAddConstraint" 
      @remove="handleRemoveConstraint" 
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
    />
  </div>
</template>