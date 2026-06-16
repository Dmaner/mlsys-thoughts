window.ML_SYSTEM_CONTENT_INDEX = [
  {
    "slug": "omni-overview",
    "title": "[Processing] vLLM-Omni Overview",
    "category": "Inference",
    "description": "OpenAPI/CLI",
    "path": "../inference/vllm/omni-overview.md",
    "createdAt": "2026-06-16T03:26:54.156Z",
    "tags": [
      "vLLM"
    ],
    "featured": false,
    "markdown": "# [Processing] vLLM-Omni Overview \n\n# Desc\n\n# TODO\n\n- 启动 orchestrator 线程交互是怎么样的, 有几个线程\n- how to load model (TTS/Omni/Diffusion)\n    - how to build stage graph  \n- 多模态请求怎么构建\n- Streaming 流程\n\n# Architecture\n\n## Entrypoint\n\n> OpenAPI/CLI\n\nkey func\n- omni_run_server\n- build_async_omni_from_stage_config\n\nmodule\n\n- AsyncOmni (EngineClient, OmniBase)\n    - generate\n\n## Engine\n\n- AsyncOmniEngine\n    - init\n        - _resolve_stage_configs: 读取配置\n        - [new thread] _bootstrap_orchestrator: 启动orchestrator\n            - _initialize_stages: 初始化stage\n        - add_request_async\n\n- Orchestrator: \n    - init: at AsyncOmniEngine\n    - run: Main entry point for the Orchestrator event loop.\n        - _request_handler: handle message from AsyncOmniEngine\n        - _orchestration_output_handler: manage inter-stage outputs\n            - _orchestration_loop\n        - _watch_replica_list:\n    - _handle_add_request\n    - _route_output\n        - _forward_to_next_stage\n\n- StagePool\n    - submit_initial\n    - process_engine_inputs\n    - [stage - stage] process_engine_inputs\n\n\n## Stage Backend\n\n- OmniARScheduler\n- OmniGenerationScheduler\n- DiffusionEngine\n\n## Model Runner\n\n- GPUARModelRunner\n\n## Config\n\n- PipelineConfig\n- StagePipelineConfig\n"
  },
  {
    "slug": "vllm-notes",
    "title": "vLLM notes",
    "category": "Inference",
    "description": "PagedAttention, continuous batching, and scheduler source analysis.",
    "path": "../inference/vllm/tutorial.md",
    "createdAt": "2026-05-21T17:31:15Z",
    "tags": [
      "vLLM",
      "Inference"
    ],
    "featured": true,
    "markdown": ""
  },
  {
    "slug": "sglang-basics",
    "title": "SGLang basics",
    "category": "Serving",
    "description": "Launch commands, request examples, resource usage, and log parsing.",
    "path": "../inference/sglang/tutorial.md",
    "createdAt": "2026-05-21T17:31:15Z",
    "tags": [
      "Sglang",
      "Tutorial"
    ],
    "featured": true,
    "markdown": "## Tutorial For SGLang Basic Usage\n\n> Tags: #Sglang #Tutorial\n\n### Installation\n\nhttps://docs.sglang.io/docs/get-started/install\n\n### Environment\n\n```bash\npython3 -m sglang.check_env\n```\n\n### Basic Usage\n\n```bash\nCUDA_VISIBLE_DEVICES=0 \\\npython3 -m sglang.launch_server \\\n--model-path Qwen/Qwen3.5-0.8B \\\n--host 0.0.0.0 \\\n--port 30000 \\\n--mem-fraction-static 0.8 \\\n--context-length 32768  \n\n# write to log file\nCUDA_VISIBLE_DEVICES=0 python3 -m sglang.launch_server --model-path Qwen/Qwen3.5-0.8B --host 0.0.0.0 --port 30000 --mem-fraction-static 0.8 --context-length 32768 > ~/inference/sglang/sglang.log 2>&1\n```\n\n\n### Send Requests\n\n```bash\ncurl http://localhost:30000/v1/chat/completions \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"Qwen/Qwen3.5-0.8B\",\n    \"messages\": [\n      {\"role\": \"user\", \"content\": \"Who are you?\"}\n    ]\n  }'\n```\n\n### Resource Usage\n\nNvidia GPU\n```\ngpustat -i 1\nnvtop\n```\n\n### CLI Args\n\n``python/sglang/srt/server_args.py``\n\n| 类别 | 重点参数 |\n| --- | --- |\n| 模型与 tokenizer | `--model-path` / `--model`, `--tokenizer-path`, `--trust-remote-code`, `--context-length` |\n| 服务入口 | `--host`, `--port`, `--served-model-name`, `--api-key` |\n| dtype / 量化 | `--dtype`, `--quantization`, `--kv-cache-dtype` |\n| 内存与调度 | `--mem-fraction-static`, `--max-total-tokens`, `--max-running-requests`, `--max-prefill-tokens`, `--chunked-prefill-size`, `--schedule-policy` |\n| 并行 | `--tp` / `--tp-size`, `--pp-size`, `--dp-size`, `--enable-dp-attention`, `--ep` / `--ep-size`, `--attention-context-parallel-size` / `--attn-cp-size` |\n| overlap / 性能 | `--disable-overlap-schedule`, `--enable-two-batch-overlap`, `--enable-single-batch-overlap`, `--mamba-scheduler-strategy`, `--page-size`, `--attention-backend` |\n| Qwen / 工具调用 | `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, `--sampling-defaults` |\n| MoE | `--moe-a2a-backend`, `--moe-runner-backend`, `--enable-eplb`, `--deepep-mode` |"
  },
  {
    "slug": "sglang-log-analysis",
    "title": "SGLang log analysis",
    "category": "Serving",
    "description": "Notes for reading and understanding SGLang runtime logs.",
    "path": "../inference/sglang/tutorial-log-parse.md",
    "createdAt": "2026-05-21T17:31:15Z",
    "tags": [
      "Sglang",
      "Logs"
    ],
    "featured": false,
    "markdown": "## Sglang's log analysis"
  },
  {
    "slug": "mlx-workflow",
    "title": "MLX workflow",
    "category": "Local models",
    "description": "Download, cache, mirror, and verify Gemma-family MLX model assets.",
    "path": "../inference/mlx/tutorial.md",
    "createdAt": "2026-05-21T17:31:15Z",
    "tags": [
      "MLX",
      "Gemma",
      "Download"
    ],
    "featured": true,
    "markdown": "# Download Gemma 4 MLX Models\n\nThis note only covers model download and Hugging Face mirror acceleration for MLX Gemma 4 models.\n\n## Cache Location\n\nUse the shared Hugging Face cache under the user home directory:\n\n```bash\nexport HF_HOME=/Users/dman/.cache/huggingface\n```\n\nDo not put model weights under the project directory. In particular, avoid using:\n\n```text\n/Users/dman/Documents/projects/aisys-thoughts/.cache/huggingface\n```\n\nThe already downloaded Gemma 4 model caches are located here:\n\n```text\n/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-e4b-it-4bit\n/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-26b-a4b-it-4bit\n/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-31b-it-4bit\n/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-31b-it-8bit\n```\n\n## Install Download Tools\n\nThe project virtual environment already contains `huggingface_hub`, but this is the reproducible install command:\n\n```bash\ncd /Users/dman/Documents/projects/aisys-thoughts\n\nenv UV_CACHE_DIR=.uv-cache \\\n  uv pip install --python .venv/bin/python -U \\\n  'huggingface_hub[hf_xet]' mlx-lm mlx-vlm\n```\n\n`hf_xet` is useful because many large Hugging Face model files are stored through Xet.\n\n## Download From Hugging Face\n\nUse `huggingface-cli download` and keep the files in the shared Hugging Face cache:\n\n```bash\ncd /Users/dman/Documents/projects/aisys-thoughts\n\nenv HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/huggingface-cli download \\\n  mlx-community/gemma-4-26b-a4b-it-4bit\n```\n\nTo download a different Gemma 4 MLX model, replace the model id:\n\n```bash\nenv HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/huggingface-cli download \\\n  mlx-community/gemma-4-31b-it-4bit\n```\n\n## Download With HF-Mirror\n\nFor faster downloads from mainland China, set `HF_ENDPOINT` to `https://hf-mirror.com`:\n\n```bash\ncd /Users/dman/Documents/projects/aisys-thoughts\n\nenv HF_ENDPOINT=https://hf-mirror.com \\\n  HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/huggingface-cli download \\\n  mlx-community/gemma-4-26b-a4b-it-4bit\n```\n\nThe same pattern works for other quantized variants:\n\n```bash\nenv HF_ENDPOINT=https://hf-mirror.com \\\n  HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/huggingface-cli download \\\n  mlx-community/gemma-4-31b-it-4bit\n\nenv HF_ENDPOINT=https://hf-mirror.com \\\n  HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/huggingface-cli download \\\n  mlx-community/gemma-4-31b-it-8bit\n\nenv HF_ENDPOINT=https://hf-mirror.com \\\n  HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/huggingface-cli download \\\n  mlx-community/gemma-4-31b-it-mxfp8\n```\n\n## One-Line Runtime Download\n\n`mlx-vlm` uses `huggingface_hub` internally, so the same environment variables also work when a model is downloaded on first run:\n\n```bash\nenv HF_ENDPOINT=https://hf-mirror.com \\\n  HF_HOME=/Users/dman/.cache/huggingface \\\n  .venv/bin/mlx_vlm.generate \\\n  --model mlx-community/gemma-4-26b-a4b-it-4bit \\\n  --max-tokens 128 \\\n  --temperature 0.0 \\\n  --prompt 'Say hello in one short sentence.'\n```\n\n## Verify Local Cache\n\nList downloaded Gemma 4 MLX model caches:\n\n```bash\nfind /Users/dman/.cache/huggingface/hub \\\n  -maxdepth 1 \\\n  -type d \\\n  -name 'models--mlx-community--gemma-4*' \\\n  -print\n```\n\nCheck disk usage:\n\n```bash\ndu -sh /Users/dman/.cache/huggingface\ndu -sh /Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4*\n```\n\n## Notes\n\n- `HF_HOME` controls the local Hugging Face cache root.\n- `HF_ENDPOINT=https://hf-mirror.com` redirects Hugging Face Hub downloads to HF-Mirror.\n- If a model is gated, apply for access on the official Hugging Face site first and pass a token to `huggingface-cli download`.\n- Prefer cache downloads over `--local-dir` when you want all models to stay under `/Users/dman/.cache/huggingface`.\n"
  }
];
