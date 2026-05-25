<script setup lang="ts">
import { ref } from 'vue';
import type { Member, Room, Constraint, AssignResult } from './types';
import { solveAssignments } from './logic/solver';

import MemberInput from './components/MemberInput.vue';
import RoomInput from './components/RoomInput.vue';
import ConstraintInput from './components/ConstraintInput.vue';
import ResultDisplay from './components/ResultDisplay.vue';

// --- データの箱 ---
const members = ref<Member[]>([]);
const rooms = ref<Room[]>([]);
const constraints = ref<Constraint[]>([]);

const result = ref<AssignResult | null>(null);
const errorMessage = ref<string>('');

// --- 追加・削除の処理 ---
const handleAddMember = (m: Member) => members.value.push(m);
const handleRemoveMember = (id: string) => members.value = members.value.filter(m => m.id !== id);

const handleAddRoom = (r: Room) => rooms.value.push(r);
const handleRemoveRoom = (id: string) => rooms.value = rooms.value.filter(r => r.id !== id);

const handleAddConstraint = (c: Constraint) => constraints.value.push(c);
const handleRemoveConstraint = (id: string) => constraints.value = constraints.value.filter(c => c.id !== id);

// --- ガチャを回す処理（本番データを使う！） ---
const runSolver = () => {
  errorMessage.value = ''; 
  result.value = null; // 前回の結果をクリア
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