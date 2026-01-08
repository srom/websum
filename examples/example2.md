```
URL: https://github.com/ggerganov/llama.cpp
context: "Extract supported model formats, hardware requirements, and basic usage example."
```
URL content summarized by AI model 'gpt-oss-20b':
**Supported model formats**  
llama.cpp requires the model to be stored in the [GGUF](__https://github.com/ggml-org/ggml/blob/master/docs/gguf.md__) file format. Models in other data formats can be converted to GGUF using the convert_*.py Python scripts in this repo.  
**Hardware requirements / supported backends**  
- Apple Silicon – optimized via ARM NEON, Accelerate and Metal frameworks  
- x86 – AVX, AVX2, AVX512 and AMX support  
- RISC‑V – RVV, ZVFH, ZFH, ZICBOP and ZIHINTPAUSE support  
- GPU – CUDA, HIP, MUSA, Vulkan, SYCL, OpenCL, ZenDNN, CANN, IBM zDNN, WebGPU (in progress)  
- CPU+GPU hybrid inference for models larger than VRAM  
**Basic usage examples**  
*Run a local model*  

llama-cli -m my_model.gguf

*Download and run a model directly from Hugging Face*  

llama-cli -hf ggml-org/gemma-3-1b-it-GGUF

*Launch an OpenAI‑compatible API server*  

llama-server -m my_model.gguf --port 8080

*Serve an embedding model*  

llama-server -m model.gguf --embedding --pooling cls -ub 8192

*Constrain output with a grammar*  
```
llama-cli -m model.gguf -n 256 --grammar-file grammars/json.gbnf -p 'Request: schedule a call at 8pm; Command:'