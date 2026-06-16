```
Tags: #MLX #Gemma #Download
Desc: Download, cache, mirror, and verify Gemma-family MLX model assets.
```

# Download Gemma 4 MLX Models

This note only covers model download and Hugging Face mirror acceleration for MLX Gemma 4 models.

## Cache Location

Use the shared Hugging Face cache under the user home directory:

```bash
export HF_HOME=/Users/dman/.cache/huggingface
```

Do not put model weights under the project directory. In particular, avoid using:

```text
/Users/dman/Documents/projects/aisys-thoughts/.cache/huggingface
```

The already downloaded Gemma 4 model caches are located here:

```text
/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-e4b-it-4bit
/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-26b-a4b-it-4bit
/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-31b-it-4bit
/Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4-31b-it-8bit
```

## Install Download Tools

The project virtual environment already contains `huggingface_hub`, but this is the reproducible install command:

```bash
cd /Users/dman/Documents/projects/aisys-thoughts

env UV_CACHE_DIR=.uv-cache \
  uv pip install --python .venv/bin/python -U \
  'huggingface_hub[hf_xet]' mlx-lm mlx-vlm
```

`hf_xet` is useful because many large Hugging Face model files are stored through Xet.

## Download From Hugging Face

Use `huggingface-cli download` and keep the files in the shared Hugging Face cache:

```bash
cd /Users/dman/Documents/projects/aisys-thoughts

env HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/huggingface-cli download \
  mlx-community/gemma-4-26b-a4b-it-4bit
```

To download a different Gemma 4 MLX model, replace the model id:

```bash
env HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/huggingface-cli download \
  mlx-community/gemma-4-31b-it-4bit
```

## Download With HF-Mirror

For faster downloads from mainland China, set `HF_ENDPOINT` to `https://hf-mirror.com`:

```bash
cd /Users/dman/Documents/projects/aisys-thoughts

env HF_ENDPOINT=https://hf-mirror.com \
  HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/huggingface-cli download \
  mlx-community/gemma-4-26b-a4b-it-4bit
```

The same pattern works for other quantized variants:

```bash
env HF_ENDPOINT=https://hf-mirror.com \
  HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/huggingface-cli download \
  mlx-community/gemma-4-31b-it-4bit

env HF_ENDPOINT=https://hf-mirror.com \
  HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/huggingface-cli download \
  mlx-community/gemma-4-31b-it-8bit

env HF_ENDPOINT=https://hf-mirror.com \
  HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/huggingface-cli download \
  mlx-community/gemma-4-31b-it-mxfp8
```

## One-Line Runtime Download

`mlx-vlm` uses `huggingface_hub` internally, so the same environment variables also work when a model is downloaded on first run:

```bash
env HF_ENDPOINT=https://hf-mirror.com \
  HF_HOME=/Users/dman/.cache/huggingface \
  .venv/bin/mlx_vlm.generate \
  --model mlx-community/gemma-4-26b-a4b-it-4bit \
  --max-tokens 128 \
  --temperature 0.0 \
  --prompt 'Say hello in one short sentence.'
```

## Verify Local Cache

List downloaded Gemma 4 MLX model caches:

```bash
find /Users/dman/.cache/huggingface/hub \
  -maxdepth 1 \
  -type d \
  -name 'models--mlx-community--gemma-4*' \
  -print
```

Check disk usage:

```bash
du -sh /Users/dman/.cache/huggingface
du -sh /Users/dman/.cache/huggingface/hub/models--mlx-community--gemma-4*
```

## Notes

- `HF_HOME` controls the local Hugging Face cache root.
- `HF_ENDPOINT=https://hf-mirror.com` redirects Hugging Face Hub downloads to HF-Mirror.
- If a model is gated, apply for access on the official Hugging Face site first and pass a token to `huggingface-cli download`.
- Prefer cache downloads over `--local-dir` when you want all models to stay under `/Users/dman/.cache/huggingface`.
