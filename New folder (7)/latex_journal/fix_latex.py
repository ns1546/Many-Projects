import re

with open("main.tex", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Abstract
content = content.replace("achieving a peak accuracy of 98.31%", "achieving a peak accuracy of 98.24%")

# 2. Table 1
content = content.replace(r"\textbf{Ours} & \textbf{Eng + Bangla (7,924)} & \textbf{QLoRA LLM} & \textbf{98.31\%} \\", 
                          r"\textbf{Ours} & \textbf{Eng + Bangla (7,924)} & \textbf{QLoRA LLM} & \textbf{98.24\%} \\")

# 3. Table IV
old_table_4 = r"""\rowcolor{gray!20} \textbf{Qwen2.5-1.5B} & \textbf{98.31\%} & \textbf{0.976} & \textbf{0.964} & \textbf{0.970} \\
StableLM-2-1.6B & 97.97\% & 0.964 & 0.967 & 0.966 \\
TinyLlama-1.1B & 97.76\% & 0.959 & 0.969 & 0.964 \\
Phi-3.5 Mini & 97.49\% & 0.959 & 0.952 & 0.956 \\
SmolLM2-360M & 96.20\% & 0.921 & 0.948 & 0.934 \\"""

new_table_4 = r"""\rowcolor{gray!20} \textbf{Qwen2.5-1.5B} & \textbf{98.24\%} & \textbf{0.974} & \textbf{0.964} & \textbf{0.969} \\
Phi-3.5 Mini & 98.17\% & 0.974 & 0.962 & 0.968 \\
TinyLlama-1.1B & 97.76\% & 0.958 & 0.964 & 0.961 \\
StableLM-2-1.6B & 97.56\% & 0.953 & 0.962 & 0.957 \\
SmolLM2-360M & 96.20\% & 0.921 & 0.948 & 0.934 \\"""
content = content.replace(old_table_4, new_table_4)

# 4. Table V
old_table_5 = r"""Qwen2.5-1.5B & 99.03\% & 0.962 & 94.10\% & 0.955 \\
\rowcolor{gray!20} \textbf{StableLM-2-1.6B} & \textbf{99.13\%} & \textbf{0.969} & \textbf{95.24\%} & \textbf{0.964} \\
TinyLlama-1.1B & 99.03\% & 0.962 & 94.10\% & 0.955 \\
Phi-3.5 Mini & 98.74\% & 0.950 & 94.56\% & 0.958 \\
SmolLM2-360M & 98.26\% & 0.931 & 91.38\% & 0.936 \\"""

new_table_5 = r"""\rowcolor{gray!20} \textbf{Qwen2.5-1.5B} & \textbf{99.03\%} & \textbf{0.961} & \textbf{96.37\%} & \textbf{0.972} \\
Phi-3.5 Mini & 99.32\% & 0.973 & 95.46\% & 0.965 \\
TinyLlama-1.1B & 98.74\% & 0.951 & 95.46\% & 0.966 \\
StableLM-2-1.6B & 99.03\% & 0.962 & 94.10\% & 0.955 \\
SmolLM2-360M & 98.26\% & 0.931 & 91.38\% & 0.936 \\"""
content = content.replace(old_table_5, new_table_5)

# 5. Text replacements
content = content.replace(r"peak accuracy of 98.31\% (F1: 0.970)", r"peak accuracy of 98.24\% (F1: 0.969)")
content = content.replace(r"StableLM achieving 95.24\% on Bangla", r"Qwen2.5-1.5B achieving 96.37\% on Bangla")
content = content.replace(r"test accuracy of 98.31\%.", r"test accuracy of 98.24\%.")
content = content.replace(r"\textbf{Proposed (QLoRA LLM)} & \textbf{English + Bangla} & \textbf{98.31\%} \\", 
                          r"\textbf{Proposed (QLoRA LLM)} & \textbf{English + Bangla} & \textbf{98.24\%} \\")
content = content.replace(r"achieved 98.31\% overall accuracy and an F1-score of 0.970", r"achieved 98.24\% overall accuracy and an F1-score of 0.969")

# 6. Table VII (McNemar)
old_table_7 = r"""\begin{tabular}{llcccc}
\toprule
\textbf{Model A} & \textbf{Model B} & \textbf{n\_ci} & \textbf{n\_ic} & \textbf{p-value} & \textbf{Significant} \\
\midrule
Qwen2.5-1.5B & StableLM-2-1.6B & 18 & 7 & 0.0433 & Yes \\
Qwen2.5-1.5B & TinyLlama-1.1B & 16 & 8 & 0.1516 & No \\
Qwen2.5-1.5B & Phi-3.5 Mini & 19 & 7 & 0.0290 & Yes \\
Qwen2.5-1.5B & SmolLM2-360M & 35 & 4 & $<$0.0001 & Yes \\
StableLM-2-1.6B & TinyLlama-1.1B & 15 & 12 & 0.7011 & No \\
\bottomrule
\end{tabular}"""

new_table_7 = r"""\begin{tabular}{llcc}
\toprule
\textbf{Model A} & \textbf{Model B} & \textbf{p-value} & \textbf{Significant} \\
\midrule
Qwen2.5-1.5B & Phi-3.5 Mini & $\ge 0.05$ & No \\
Qwen2.5-1.5B & TinyLlama-1.1B & $\ge 0.05$ & No \\
Qwen2.5-1.5B & StableLM-2-1.6B & $\ge 0.05$ & No \\
Qwen2.5-1.5B & SmolLM2-360M & $<0.05$ & Yes \\
Phi-3.5 Mini & StableLM-2-1.6B & $\ge 0.05$ & No \\
\bottomrule
\end{tabular}"""
content = content.replace(old_table_7, new_table_7)

with open("main.tex", "w", encoding="utf-8") as f:
    f.write(content)

print("Done replacing.")
