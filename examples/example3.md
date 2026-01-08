```
URL: https://lilianweng.github.io/posts/2023-06-23-agent/
context: None.
```
URL content summarized by AI model 'gpt-oss-20b':

**Introduction**  
> Building agents with LLM (large language model) as its core controller is a cool concept. Several proof‑of‑concept demos, such as AutoGPT, GPT‑Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well‑written copies, stories, essays and programs; it can be framed as a powerful general problem solver.  

**Agent System Overview**  
> In a LLM‑powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:  
> - **Planning** – Subgoal and decomposition; Reflection and refinement.  
> - **Memory** – Short‑term memory (in‑context learning) and long‑term memory (external vector store).  
> - **Tool use** – The agent learns to call external APIs for extra information that is missing from the model weights.  

**Component One: Planning – Task Decomposition**  
> **Chain of thought** (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test‑time computation to decompose hard tasks into smaller and simpler steps.  
> **Tree of Thoughts** (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure.  

**Component One: Planning – Self‑Reflection**  
> **ReAct** (Yao et al. 2023) integrates reasoning and acting within LLM by extending the action space to be a combination of task‑specific discrete actions and the language space. The ReAct prompt template incorporates explicit steps for LLM to think, roughly formatted as:  
> ```
> Thought: ...
> Action: ...
> Observation: ...
> … (Repeated many times)
> ```  
> **Reflexion** (Shinn & Labash 2023) is a framework to equip agents with dynamic memory and self‑reflection capabilities to improve reasoning skills.  
> **Chain of Hindsight** (CoH; Liu et al. 2023) encourages the model to improve on its own outputs by explicitly presenting it with a sequence of past outputs, each annotated with feedback.  

**Component Two: Memory – Types of Memory**  
> Memory can be defined as the processes used to acquire, store, retain, and later retrieve information. There are several types of memory in human brains:  
> 1. **Sensory Memory** – retains impressions of sensory information for a few seconds.  
> 2. **Short‑Term Memory (STM)** – stores information that we are currently aware of and needed to carry out complex cognitive tasks.  
> 3. **Long‑Term Memory (LTM)** – can store information for a remarkably long time, ranging from a few days to decades.  

**Component Two: Memory – Maximum Inner Product Search (MIPS)**  
> The external memory can alleviate the restriction of finite attention span. A standard practice is to save the embedding representation of information into a vector store database that can support fast maximum inner‑product search (MIPS).  
> A couple common choices of ANN algorithms for fast MIPS:  
> - **LSH** (Locality‑Sensitive Hashing)  
> - **ANNOY** (Approximate Nearest Neighbors Oh Yeah)  
> - **HNSW** (Hierarchical Navigable Small World)  
> - **FAISS** (Facebook AI Similarity Search)  
> - **ScaNN** (Scalable Nearest Neighbors)  

**Component Three: Tool Use – MRKL**  
> **MRKL** (Karpas et al. 2022), short for “Modular Reasoning, Knowledge and Language”, is a neuro‑symbolic architecture for autonomous agents. A MRKL system is proposed to contain a collection of “expert” modules and the general‑purpose LLM works as a router to route inquiries to the best suitable expert module.  

**Component Three: Tool Use – Toolformer & TALM**  
> Both **TALM** (Tool Augmented Language Models; Parisi et al. 2022) and **Toolformer** (Schick et al. 2023) fine‑tune a LM to learn to use external tool APIs.  

**Case Study – Scientific Discovery Agent**  
> **ChemCrow** (Bran et al. 2023) is a domain‑specific example in which LLM is augmented with 13 expert‑designed tools to accomplish tasks across organic synthesis, drug discovery, and materials design. The workflow, implemented in LangChain, reflects what was previously described in the ReAct and MRKL and combines CoT reasoning with tools relevant to the tasks.  

**Case Study – Generative Agents Simulation**  
> **Generative Agents** (Park et al. 2023) is a super fun experiment where 25 virtual characters, each controlled by a LLM‑powered agent, are living and interacting in a sandbox environment, inspired by The Sims. Generative agents create believable simulacra of human behavior for interactive applications.  

**Challenges**  
> - **Finite context length**: The restricted context capacity limits the inclusion of historical information, detailed instructions, API call context, and responses.  
> - **Challenges in long‑term planning and task decomposition**: Planning over a lengthy history and effectively exploring the solution space remain challenging.  
> - **Reliability of natural language interface**: Current agent system relies on natural language as an interface between LLMs and external components such as memory and tools.  

**Conclusion**  
> The article surveys the core components of LLM‑powered autonomous agents—planning, memory, and tool use—illustrates them with state‑of‑the‑art techniques (CoT, Tree of Thoughts, ReAct, Reflexion, CoH, MRKL, Toolformer), and showcases practical case studies (ChemCrow, Generative Agents). It also highlights key challenges such as finite context, long‑term planning, and interface reliability, pointing toward future research directions in building robust, scalable autonomous agents.