```
Tags: #vLLM #vLLM-Omni
Desc: Explore vllm-omni internals — how multimodal serving optimization works. 
```

# [Processing] vLLM-Omni Overview 


# TODO

- 启动 orchestrator 线程交互是怎么样的, 有几个线程
- how to load model (TTS/Omni/Diffusion)
    - how to build stage graph  
- 多模态请求怎么构建
- Streaming 流程

# Architecture

## Entrypoint

> OpenAPI/CLI

key func
- omni_run_server
- build_async_omni_from_stage_config

module

- AsyncOmni (EngineClient, OmniBase)
    - generate

## Engine

- AsyncOmniEngine
    - init
        - _resolve_stage_configs: 读取配置
        - [new thread] _bootstrap_orchestrator: 启动orchestrator
            - _initialize_stages: 初始化stage
        - add_request_async

- Orchestrator: 
    - init: at AsyncOmniEngine
    - run: Main entry point for the Orchestrator event loop.
        - _request_handler: handle message from AsyncOmniEngine
        - _orchestration_output_handler: manage inter-stage outputs
            - _orchestration_loop
        - _watch_replica_list:
    - _handle_add_request
    - _route_output
        - _forward_to_next_stage

- StagePool
    - submit_initial
    - process_engine_inputs
    - [stage - stage] process_engine_inputs


## Stage Backend

- OmniARScheduler
- OmniGenerationScheduler
- DiffusionEngine

## Model Runner

- GPUARModelRunner

## Config

- PipelineConfig
- StagePipelineConfig
