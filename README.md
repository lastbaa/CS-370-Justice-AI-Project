# CS-370-Justice-AI-Project

## Justice AI v1

##Purpose:
Legal professionals are highly specialized, and expensive individuals. Their time is best spent on complex tasks that involve intimate sector expertise, historical knowledge, and client interaction. Monotonous document review is not an efficient use of their time. Our aim in this project is to cut down total time spent on a given case, by providing a secure, locally run LLM system that prioritizes truth.  

##Overview:
We seek to achieve our goals of truth-seeking and security through a few key steps:

###RAG - Truth Optimization:
This app will come pre-loaded with relevant legal doctrine, including the full text of the code of federal regulations, the entire tax code, and more(this is a work-in-progress matter in which we are soliciting advice from legal professionals). The client will also have the ability to “upload” their case-specific files to the system. When answering prompts, the LLM will have a mandate to produce exact citations from case documents, and legal code. These are easily checkable after generation, before integration into any legal analysis from the human, through a simple command f. 

###LLM - Security Considerations:
Current specialized legal LLMs and general purpose LLMs all require some interaction with cloud-based services. Despite security promises from corporations, introducing sensitive client information into the hands of a black box system inherently creates new security threat vectors. Personal, decentralized, information ownership is vital in promoting secure practices in fields like law where professionals handle extremely sensitive personal information. The security goal here is not to create a hardened military-grade system impervious to any breaches, but to maintain the same threat level that law offices currently incur. This means, not introducing any new external systems. By running locally, offices will have full control over their client data.

###LLM - Efficacy:
For this application we have selected [Saul-7B](https://arxiv.org/pdf/2403.03883), a relatively low parameter count model capable of running on the higher end of consumer grade hardware. This model is a fine-tuned for legal applications version of the Mistral-7B model. Future updates of this application may be with a different model that we fine tune ourselves. An important note with model selection is that our key goal is to have a model that can run on a large variety of consumer hardware, while having enough reasoning ability to parse documents and pick up on key concepts. This is absolutely not meant to be a legal reasoning LLM. This is an assistant for professionals that will be able to enhance workflows through a semantic search and summarization ability. 

