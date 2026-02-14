# 🧠 Inference-system-thoughts

![CUDA](https://img.shields.io/badge/CUDA-12.x-76B900) ![System](https://img.shields.io/badge/System-ML_Inference-blue) ![Status](https://img.shields.io/badge/Status-Active-success)

> **记录推理系统工程（Inference System Engineering）的学习路径、源码分析与架构思考。**

---

## 🚧 Current Working On (正在进行)
> *Focusing on...*

- [ ] **FlashAttention-3**: 深入阅读论文并尝试用 Triton 复现简化版。
- [ ] **vLLM Core**: 分析 vLLM 的 Block Manager 内存管理机制。
- [ ] **INT8 Quantization**: 调研 SmoothQuant 在实际生产环境中的精度损失。

---

## 📚 Reading Notes (阅读/学习笔记)

这里存放通过阅读论文、源码和书籍沉淀下来的结构化笔记。

### 1. Basic (基础与理论)
> *Computer Architecture, OS, & MLSys Fundamentals*
[📂 进入文件夹](./notes/basic)

- **Memory Hierarchy**: GPU 显存与缓存一致性模型。
- **Distributed Systems**: Raft 协议与参数服务器 (Parameter Server) 架构。
- **Math**: 矩阵乘法 (GEMM) 的数学原理与分块策略。

### 2. CUDA & Kernels (底层优化)
> *Bare-metal performance optimization*
[📂 进入文件夹](./notes/cuda)

- **CUDA Programming**: Thread Layout, Warp Shuffle, Shared Memory Bank Conflict.
- **Triton DSL**: 使用 Triton 编写高性能 Softmax 算子。
- **Operator Fusion**: 算子融合的模式与手写实现。

### 3. Inference Engine (推理引擎架构)
> *Architecture of Modern LLM Serving Systems*
[📂 进入文件夹](./notes/engines)

- **vLLM**: PagedAttention 原理与调度策略源码分析。
- **TensorRT-LLM**: TensorRT 的图优化与 Plugin 机制。
- **TGI (Text Generation Inference)**: Rust 在推理服务中的应用。
- **Serving Strategies**: Continuous Batching, Speculative Decoding.

---

## 💡 Thoughts (文章与思考)
> *My essays, architectural designs, and trade-off analysis.*
[📂 进入文件夹](./thoughts)

- **[2024-XX-XX]** [为什么我们需要分离式推理架构 (Prefill-Decode Disaggregation)?](./thoughts/disaggregation-arch.md)
- **[2024-XX-XX]** [浅谈 Python 在推理胶水层 (Glue Layer) 的性能开销](./thoughts/python-overhead.md)
- **[2024-XX-XX]** [关于大模型推理显存墙 (Memory Wall) 的未来思考](./thoughts/memory-wall.md)

---

## 💬 About

这里是 **[你的名字/ID]** 的思维后花园。

在这个仓库中，我致力于探索 **Model Algorithm** 与 **Hardware Silicon** 之间的中间层。关注如何构建高吞吐、低延迟的大模型推理系统。

如果你对 SysML、高性能计算 (HPC) 或 LLM Infra 感兴趣，欢迎交流！

- **Email**: your.email@example.com
- **Blog/Twitter**: [Link]
