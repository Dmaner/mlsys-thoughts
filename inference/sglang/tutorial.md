## Tutorial For SGLang Basic Usage

> Tags: #Sglang #Tutorial

### Installation

https://docs.sglang.io/docs/get-started/install

### Environment

```bash
python3 -m sglang.check_env
```

### Basic Usage

```bash
CUDA_VISIBLE_DEVICES=0 \
python3 -m sglang.launch_server \
--model-path Qwen/Qwen3.5-0.8B \
--host 0.0.0.0 \
--port 30000 \
--mem-fraction-static 0.8 \
--context-length 32768  

# write to log file
CUDA_VISIBLE_DEVICES=0 python3 -m sglang.launch_server --model-path Qwen/Qwen3.5-0.8B --host 0.0.0.0 --port 30000 --mem-fraction-static 0.8 --context-length 32768 > ~/inference/sglang/sglang.log 2>&1
```


### Send Requests

```bash
curl http://localhost:30000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3.5-0.8B",
    "messages": [
      {"role": "user", "content": "Who are you?"}
    ]
  }'
```

### Resource Usage

Nvidia GPU
```
gpustat -i 1
nvtop
```

### CLI Args

``python/sglang/srt/server_args.py``

| 类别 | 重点参数 |
| --- | --- |
| 模型与 tokenizer | `--model-path` / `--model`, `--tokenizer-path`, `--trust-remote-code`, `--context-length` |
| 服务入口 | `--host`, `--port`, `--served-model-name`, `--api-key` |
| dtype / 量化 | `--dtype`, `--quantization`, `--kv-cache-dtype` |
| 内存与调度 | `--mem-fraction-static`, `--max-total-tokens`, `--max-running-requests`, `--max-prefill-tokens`, `--chunked-prefill-size`, `--schedule-policy` |
| 并行 | `--tp` / `--tp-size`, `--pp-size`, `--dp-size`, `--enable-dp-attention`, `--ep` / `--ep-size`, `--attention-context-parallel-size` / `--attn-cp-size` |
| overlap / 性能 | `--disable-overlap-schedule`, `--enable-two-batch-overlap`, `--enable-single-batch-overlap`, `--mamba-scheduler-strategy`, `--page-size`, `--attention-backend` |
| Qwen / 工具调用 | `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, `--sampling-defaults` |
| MoE | `--moe-a2a-backend`, `--moe-runner-backend`, `--enable-eplb`, `--deepep-mode` |