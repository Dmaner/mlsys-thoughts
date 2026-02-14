# 🧠 Inference-system-thoughts

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md) ![CUDA](https://img.shields.io/badge/CUDA-12.x-76B900) ![System](https://img.shields.io/badge/System-ML_Inference-blue)

> **记录推理系统工程（Inference System Engineering）的学习路径、源码分析与架构思考。**
> *从 CUDA 算子到底层基础设施的探索。*

---

## 🚧 正在进行 (Current Working On)

> *当前关注的重点与正在 Debug 的问题。*

- [ ] **FlashAttention-3**: 深入阅读论文并尝试用 Triton 复现简化版。
- [ ] **vLLM Core**: 分析 vLLM 的 Block Manager 内存管理机制。
- [ ] **量化技术**: 调研 SmoothQuant 在实际生产环境中的精度损失。

---

## 📚 阅读笔记 (Reading Notes)

这里存放通过阅读论文、源码和书籍沉淀下来的结构化笔记。

### 1. [基础理论 (Basic)](./notes/basic)
> *计算机体系结构、操作系统与 MLSys 基础。*

- **存储层次结构**: GPU 显存与缓存一致性模型。
- **分布式系统**: Raft 协议与参数服务器 (Parameter Server) 架构。
- **数学基础**: 矩阵乘法 (GEMM) 的数学原理与分块策略。

### 2. [CUDA 与算子 (CUDA & Kernels)](./notes/cuda)
> *底层性能优化与算子实现。*

- **CUDA 编程**: 线程布局、Warp Shuffle、Shared Memory Bank Conflict。
- **Triton DSL**: 使用 Triton 编写高性能 Softmax 算子。
- **算子融合**: 算子融合的模式与手写实现。

### 3. [推理引擎 (Inference Engine)](./notes/engines)
> *现代 LLM Serving 系统架构分析。*

- **vLLM**: PagedAttention 原理与调度策略源码分析。
- **TensorRT-LLM**: TensorRT 的图优化与 Plugin 机制。
- **TGI**: Rust 在推理服务中的应用。
- **Serving 策略**: Continuous Batching, Speculative Decoding。

---

## 💡 思考与文章 (Thoughts)

> *我的随笔、架构设计草图与工程权衡分析。*

- **[2024-XX-XX]** [为什么我们需要分离式推理架构 (Prefill-Decode Disaggregation)?](./thoughts/disaggregation-arch.md)
- **[2024-XX-XX]** [浅谈 Python 在推理胶水层 (Glue Layer) 的性能开销](./thoughts/python-overhead.md)
- **[2024-XX-XX]** [关于大模型推理显存墙 (Memory Wall) 的未来思考](./thoughts/memory-wall.md)

---

## 💬 关于 (About)

这里是我的推理系统工程思维后花园。

在这个仓库中，我致力于探索 **模型算法 (Algorithm)** 与 **底层算力 (Hardware)** 之间的中间层。关注如何构建高吞吐、低延迟的大模型推理系统。

如果你对 SysML、高性能计算 (HPC) 或 LLM Infra 感兴趣，欢迎交流！

- **Email**: [你的邮箱]
- **Blog/Twitter**: [你的链接]
