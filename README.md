# 🧠 Inference-system-thoughts

[![Chinese](https://img.shields.io/badge/Language-中文-red)](./README_zh.md) ![CUDA](https://img.shields.io/badge/CUDA-12.x-76B900) ![System](https://img.shields.io/badge/System-ML_Inference-blue) ![Status](https://img.shields.io/badge/Status-Active_Learning-success)

> **Engineering notes, architectural designs, and performance optimization techniques for AI Inference Systems.**
> *From CUDA kernels to distributed serving infrastructure.*

---

## 🚧 Current Working On

> *What I am currently focusing on or debugging.*

- [ ] **FlashAttention-3**: Reading the paper and attempting a simplified Triton implementation.
- [ ] **vLLM Core**: Analyzing the memory management mechanism of the Block Manager.
- [ ] **Quantization**: Investigating accuracy loss of SmoothQuant in production environments.

---

## 📚 Reading Notes

Structured notes from papers, source code analysis, and technical books.

### 1. [Basic](./notes/basic)
> *Fundamentals of Computer Architecture, OS, and MLSys.*

- **Memory Hierarchy**: GPU memory models and cache coherence.
- **Distributed Systems**: Raft protocol and Parameter Server architecture.
- **Math**: Mathematical principles of Matrix Multiplication (GEMM) and tiling strategies.

### 2. [CUDA & Kernels](./notes/cuda)
> *Bare-metal performance optimization.*

- **CUDA Programming**: Thread Layout, Warp Shuffle, Shared Memory Bank Conflicts.
- **Triton DSL**: Writing high-performance Softmax kernels using Triton.
- **Operator Fusion**: Patterns and manual implementation of fused kernels.

### 3. [Inference Engine](./notes/engines)
> *Architecture of Modern LLM Serving Systems.*

- **vLLM**: Deep dive into PagedAttention and scheduler source code.
- **TensorRT-LLM**: TensorRT graph optimization and Plugin mechanisms.
- **TGI**: Rust applications in inference serving.
- **Serving Strategies**: Continuous Batching, Speculative Decoding.

---

## 💡 Thoughts

> *My essays, architectural designs, and trade-off analysis.*

- **[2024-XX-XX]** [Why we need Prefill-Decode Disaggregation architecture?](./thoughts/disaggregation-arch.md) (Chinese)
- **[2024-XX-XX]** [The overhead of Python "Glue Layer" in Inference](./thoughts/python-overhead.md) (Chinese)
- **[2024-XX-XX]** [Future thoughts on the Memory Wall in LLM Serving](./thoughts/memory-wall.md) (Chinese)

---

## 💬 About

This repository serves as my "Digital Garden" for **Inference System Engineering**.

I aim to bridge the gap between **Model Algorithms** and **Hardware Silicon**, focusing on building high-throughput, low-latency LLM inference systems.

If you are interested in SysML, HPC, or LLM Infra, feel free to reach out!

- **Email**: [Your Email]
- **Blog/Twitter**: [Your Link]
