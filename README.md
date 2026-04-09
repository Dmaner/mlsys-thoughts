# 🧠 ML System Thoughts

[![Chinese](https://img.shields.io/badge/Language-中文-red)](./README_zh.md)

> **Recording the learning path, source code analysis, and architectural thinking of Machine Learning Systems.**

---

## 🚧 Current Working On

> Current focus and ongoing exploration.

- [ ] **Deep in vLLM** — Exploring PagedAttention and scheduler implementation details
- [ ] **CUDA Kernel Optimization** — Hand-writing high-performance kernels and understanding low-level performance tuning

---

## 📚 Reading Notes

### 1. [Foundations](./basic)

### 2. [Inference Systems](./inference)

> Architecture analysis of modern LLM inference engines.

- [vLLM](./inference/vllm) — PagedAttention, Continuous Batching, scheduler source code analysis

### 3. [CUDA Programming](./cuda)

> GPU low-level performance optimization and operator implementation.

- [Kernel Implementation](./cuda/kernel) — Hand-written CUDA basic operators

### 4. [Training Systems](./training)

> Distributed training frameworks and optimization techniques.

### 5. [Agent Systems](./agent)

> AI Agent architecture and engineering practices.

---

## 🎯 About This Project

This is my **Digital Garden for ML Systems**, focusing on bridging the gap between machine learning algorithms and system engineering.

Focus areas:
- **Inference Optimization** — Low-latency serving, memory management, throughput optimization
- **System Architecture** — End-to-end understanding from training frameworks to inference engines
