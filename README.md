# AETHER CLOCK — 究極のリアルタイム時計

> PC表示専用・超高クオリティーなリアルタイム時計ビジュアライザー。
> Canvas / Web Audio / 高度なCSSアニメーションを駆使した、5種類の時計モードと豊富なエフェクトを備えたシングルページアプリケーション。

---

## 🎯 プロジェクト概要

| 項目 | 内容 |
|------|------|
| 名称 | **AETHER CLOCK** |
| 目的 | 極限まで作り込まれたリアルタイム時計表示専用サイト |
| 対象 | PC（デスクトップ）ブラウザ専用 |
| 技術 | 純粋な HTML5 / CSS3 / Vanilla JavaScript（外部ライブラリはフォント・アイコンのみ） |

---

## ✨ 実装済みの機能

### 時計モード（5種類）
1. **HYBRID（ハイブリッド）** — アナログ＋デジタルを同時表示（デフォルト）
2. **ANALOG（アナログ）** — Canvasで描画する高精細アナログ時計
   - スムーズスイープ秒針 / 発光する目盛り / 数字 / 日付サブダイヤル / カウンターウェイト
3. **DIGITAL（デジタル）** — フリップアニメーション付き大型デジタル表示
   - ミリ秒表示 / 24h・12h切替 / 時分秒の進捗バー / 週番号 / AM/PM
4. **BINARY（バイナリ）** — BCD（二進化十進）方式のバイナリ時計
5. **WORD（ワードクロック）** — 英語で時刻を文章表示する古典的時計

### ビジュアルエフェクト
- 🌌 **パーティクルネットワーク背景**（マウスインタラクション付き・密度調整可能）
- 🎆 **オーロラ/プラズマ背景**（流体アニメーション）
- パースペクティブグリッド / ビネット / ノイズ / グラデーションオーバーレイ
- グリッチエフェクト（トグル可能）
- 起動時のローディングシーケンス演出

### テーマシステム（9種類）
`Aurora` / `Sunset` / `Emerald` / `Crimson` / `Midnight` / `Gold` / `Mono` / `Cyberpunk` / `Ice`

### サイド情報パネル
- システム時刻 / FPSメーター / 稼働時間 / 精度バー
- 1日の進捗リング / 日の出・日の入り / 月相（照度%）/ 季節

### ツール
- ⏱️ **ストップウォッチ**（高精度・ラップ・最速/最遅ハイライト）
- ⏳ **タイマー**（プリセット付き・終了アラーム音）
- 🌍 **世界時計**（8都市・昼夜判定）

### その他
- 🔊 Web Audio APIによるティック音・アラーム音生成
- 🌐 タイムゾーン切替（21地域）
- 設定の自動保存（localStorage）
- フルスクリーン対応
- キーボードショートカット
- PC専用警告（小画面時）

---

## ⌨️ キーボードショートカット

| キー | 動作 |
|------|------|
| `1`〜`5` | 表示モード切替（Hybrid / Analog / Digital / Binary / Word） |
| `F` | フルスクリーン切替 |
| `S` | 設定パネル開閉 |
| `T` | テーマを順送り |
| `H` | HUD（情報表示）の表示/非表示 |
| `G` | グリッチエフェクト切替 |
| `Esc` | パネルを閉じる |

---

## 🗂️ ファイル構成

```
index.html                  メインページ（唯一のエントリポイント）
README.md
css/
  ├── reset.css             ブラウザリセット
  ├── variables.css         デザイントークン（CSS変数）
  ├── layout.css            全体レイアウト
  ├── components.css        UIコンポーネント
  ├── clock-analog.css      アナログ時計スタイル
  ├── clock-digital.css     デジタル時計スタイル
  ├── panels.css            設定・ツールパネル
  ├── animations.css        キーフレームアニメーション
  ├── themes.css            9テーマ定義
  ├── effects.css           ローディング・特殊エフェクト
  └── responsive.css        画面幅対応
js/
  ├── utils/                math / time / dom / storage
  ├── core/                 state（状態管理）/ events（バス・ループ）
  ├── data/                 timezones / themes
  ├── astro/                astronomy（月相・日の出計算）
  ├── clocks/               analog / digital / binary / word
  ├── background/           particles / aurora
  ├── ui/                   panels / settings / sidebar
  ├── tools/                stopwatch / timer / worldclock
  ├── audio/                sound（Web Audio）
  └── main.js               初期化とオーケストレーション
```

---

## 🌐 機能エントリ URI

本サイトはシングルページアプリケーションです。

| パス | 説明 |
|------|------|
| `/index.html` または `/` | メインアプリケーション（全機能を内包） |

URLパラメータは使用していません。すべての状態は localStorage に保存されます。

---

## 💾 データモデル / ストレージ

サーバーDBは使用していません。設定は **ブラウザの localStorage** に保存されます。

**保存キー:** `aether_clock_state`

```jsonc
{
  "mode": "hybrid",        // 表示モード
  "theme": "aurora",       // テーマID
  "sweep": true,           // 秒針スムーズスイープ
  "showMs": true,          // ミリ秒表示
  "is24h": true,           // 24時間表記
  "particles": true,       // パーティクル背景
  "aurora": true,          // オーロラ背景
  "glitch": false,         // グリッチエフェクト
  "tickSound": false,      // ティック音
  "timezone": "local",     // タイムゾーン
  "density": 120,          // 粒子密度
  "glow": 100,             // 発光強度
  "soundEnabled": false,   // サウンド全体
  "hudHidden": false       // HUD表示状態
}
```

---

## 🚧 未実装 / 今後の拡張候補

- WebGLシェーダーによる本格的な3D背景
- 時計フェイスのカスタムデザインエディタ
- カレンダー / 祝日表示
- アラーム（複数登録）機能
- ポモドーロモード
- PWA対応（オフライン動作）
- カスタムテーマ作成・保存

---

## 🚀 デプロイ方法

本サイトを公開するには、画面上部の **Publish タブ** から1クリックで公開できます。
Publish タブがデプロイ処理を自動で行い、ライブURLを発行します。

---

## 📝 技術ハイライト

- **共有 requestAnimationFrame ループ**（`AC.Loop`）で全描画系を統合し、FPSを一元計測
- **イベントバス**（`AC.Bus`）によるモジュール間の疎結合な通信
- 非表示モードの描画をスキップしてCPU負荷を最適化
- devicePixelRatio対応の高解像度Canvas描画
- `prefers-reduced-motion` への配慮

---

**AETHER CLOCK** — Realtime Precision Engine.
