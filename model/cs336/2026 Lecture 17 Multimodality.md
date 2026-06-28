```
Tags: #CS336 #Multimodality #VisionLanguage
Desc: Notes from CS336 Lecture 17 on multimodality, visual encoders, image-token injection, and omni model design.
```

# Lecture 17: Alignment - Multimodality

> Lecture : https://www.youtube.com/watch?v=26FtD08ZpOU&list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV&index=17 \
> Slides: https://cs336.stanford.edu/lectures/?trace=lecture_17

# Keywords

> CLIP, LLAVA, QWEN VL, Multimodality

# Lectures Notes

课程大纲

- Encoding images
- Injecting image encodings into LLMs
- Towards Omni models

## ViT

![arch](assets/vit.png)

## CLIP

自然语言可以作为通用的视觉监督

> https://arxiv.org/abs/2103.00020


![CLIP](assets/clip.png)

pseudocode

![CLIP](assets/code-clip.png)

## llava

Image -> Vision Encoder: CLIP -> Projection -> LM

![llava](assets/llava.png)

llava onevision

![llava_onevision](assets/llava_onevision.png)

## Qwen-VL

Qwen2-VL

![Qwen2-VL](assets/qwen2-vl.png)

Qwen3-VL

![Qwen3-VL](assets/qwen3-vl.png)

# Explore

## Omni Model

Qwen3-Omni

![arch](assets/qwen3-omni.png)

AuT

![arch](assets/aut.png)
