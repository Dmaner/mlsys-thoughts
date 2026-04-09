# 🧠 ML System 思考录

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md)

> **记录机器学习系统（ML System）的学习路径、源码分析与架构思考。**

---

## 🚧 正在进行

> 当前关注的重点与正在探索的问题。

- [ ] **深入 vLLM** —— 探究 PagedAttention 与调度机制的实现细节
- [ ] **CUDA 算子优化** —— 手写高性能 Kernel，理解底层性能调优

---

## 📚 阅读笔记

### 1. [基础理论](./basic)

### 2. [推理系统](./inference)

> 现代 LLM 推理引擎架构分析。

- [vLLM](./inference/vllm) —— PagedAttention、Continuous Batching、调度器源码解析

### 3. [CUDA 编程](./cuda)

> GPU 底层性能优化与算子实现。

- [Kernel 实现](./cuda/kernel) —— CUDA 基础算子手写实现

### 4. [训练系统](./training)

> 分布式训练框架与优化技术。

### 5. [Agent 系统](./agent)

> AI Agent 架构与工程实践。

---

## 🎯 关于本项目

这是我的 **ML System 数字花园**，专注于连接机器学习算法与系统工程的桥梁。

聚焦领域：
- **推理优化** —— 低延迟服务、内存管理、吞吐优化
- **系统架构** —— 从训练框架到推理引擎的全链路理解
