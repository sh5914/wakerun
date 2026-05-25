// src/env.d.ts

// TypeScriptに「.vueファイルはこういう型だよ」と教える設定
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}