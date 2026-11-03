import re

with open('latex_journal/main (1).tex', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Clean up Table I
table_1 = r'''\begin{table*}[htbp]
\caption{Comparative Summary of Reviewed Methods}
\label{tab:comparative}
\begin{center}
\resizebox{\textwidth}{!}{
\begin{tabular}{lllccl}
\toprule
\textbf{Ref.} & \textbf{Dataset} & \textbf{Architecture} & \textbf{Max Acc.} & \textbf{Language} & \textbf{Research Gap} \\
\midrule
\cite{ref1} & SMS Spam Collection (5,574) & SVM, Na\"{\i}ve Bayes & 97.64\% & English only & Limited semantic depth for short texts \\
\cite{ref2} & 6,000 URLs & XGBoost (DOM+URL features) & 99.17\% & English only & Vulnerable to non-HTML evasion \\
\cite{ref3} & PhishTank ($\sim$13,700 URLs) & RNN-LSTM & 97.40\% & English only & High compute; no unsupervised augmentation \\
\cite{ref4} & 6 Bangla datasets & mBERT, XLM-RoBERTa & 93.80\% & Bangla only & Subword tokenization limits; multilingual dilution \\
\cite{ref5} & SMS Spam v1 (5,169) & Na\"{\i}ve Bayes + Slang Dict. & 96.20\% & English only & Ignores embedded URL behavior \\
\cite{ref6} & SMS Phishing (7,261) & TF-IDF+LDA+Word2Vec+XGBoost & 98.47\% & English only & No cross-lingual capability \\
\cite{ref7} & 11,599 Bangla SMS & BiLSTM, BiGRU, 1D-CNN & 99.00\% & Bangla only & No MFS-fraud focus; no English coverage \\
\cite{ref8} & URL phishing database & RF, SVM, KNN, LR & 91.40\% & English only & Traditional ML limits sequential learning \\
\cite{ref9} & Enron + SpamAssassin & GloVe + Bi-LSTM & $\sim$98.00\% & English only & Not suited for short SMS-style messages \\
\cite{ref10} & 84,000 global SMS & Semantic tagging + multi-signal NLP & 97.89\% & Mostly English & No Bangla linguistic adaptation \\
\textbf{Ours} & \textbf{English + Bangla combined} & \textbf{QLoRA-fine-tuned LLMs} & \textbf{98.31\%} & \textbf{English + Bangla} & \textbf{None --- addresses all identified gaps} \\
\bottomrule
\end{tabular}
}
\end{center}
\end{table*}'''

# 2. Table II
table_2 = r'''\begin{table}[htbp]
\caption{Dataset Composition Before Preprocessing}
\label{tab:dataset_raw}
\begin{center}
\resizebox{\columnwidth}{!}{
\begin{tabular}{lll}
\toprule
\textbf{Attribute} & \textbf{English (SMS Spam)} & \textbf{Bangla (Phishing/Spam)} \\
\midrule
Total Records & 5,574 & 2,350 \\
Ham (Label = 0) & $\sim$4,827 & 810 \\
Spam (Label = 1) & $\sim$747 & 1,540 \\
Language & English & Bangla (code-mixed) \\
Source & Public repo \cite{ref1} & Native corpus \\
Template Metadata & None & template\_id per record \\
\bottomrule
\end{tabular}
}
\end{center}
\end{table}'''

# 3. Table III
table_3 = r'''\begin{table}[htbp]
\caption{Record Counts After Each Preprocessing Stage}
\label{tab:dataset_prep}
\begin{center}
\begin{tabular}{lcc}
\toprule
\textbf{Stage} & \textbf{English Records} & \textbf{Bangla Records} \\
\midrule
Raw & 5,574 & 2,350 \\
After Null Removal & 5,500 & 2,280 \\
After Deduplication & 5,170 & 2,205 \\
Final & 5,170 & 2,205 \\
\bottomrule
\end{tabular}
\end{center}
\end{table}'''

# 4. Table IV
table_4 = r'''\begin{table}[htbp]
\caption{Training Set Class Distribution Before and After SMOTE}
\label{tab:smote}
\begin{center}
\begin{tabular}{lcc}
\toprule
\textbf{Class} & \textbf{Before SMOTE} & \textbf{After SMOTE} \\
\midrule
Ham (0) & 4,216 & 4,216 \\
Spam (1) & 1,684 & 4,216 \\
\textbf{Total} & \textbf{5,900} & \textbf{8,432} \\
\bottomrule
\end{tabular}
\end{center}
\end{table}'''

# 5. Table V
table_5 = r'''\begin{table*}[htbp]
\caption{Summary of Selected Pretrained LLMs}
\label{tab:models}
\begin{center}
\begin{tabular}{llcl}
\toprule
\textbf{Model Name} & \textbf{Hugging Face ID} & \textbf{Approx. Params} & \textbf{Architecture} \\
\midrule
Phi-3.5 Mini & microsoft/Phi-3.5-mini-instruct & $\sim$3.8B & Transformer (dense) \\
Qwen2.5-1.5B & Qwen/Qwen2.5-1.5B-Instruct & $\sim$1.5B & Transformer (dense) \\
TinyLlama-1.1B & TinyLlama/TinyLlama-1.1B-Chat-v1.0 & $\sim$1.1B & LLaMA architecture \\
StableLM-2-1.6B & stabilityai/stablelm-2-1\_6b-chat & $\sim$1.6B & Transformer (dense) \\
SmolLM2-360M & HuggingFaceTB/SmolLM2-360M-Instruct & $\sim$360M & Transformer (compact) \\
\bottomrule
\end{tabular}
\end{center}
\end{table*}'''

# 6. Table VI
table_6 = r'''\begin{table}[htbp]
\caption{QLoRA Hyperparameter Configuration}
\label{tab:qlora}
\begin{center}
\begin{tabular}{ll}
\toprule
\textbf{Hyperparameter} & \textbf{Value} \\
\midrule
Quantization & 4-bit NF4 w/ double quant \\
Compute dtype & float16 \\
LoRA rank (r) & 16 \\
LoRA alpha & 32 \\
LoRA dropout & 0.05 \\
Target modules & Architecture-specific \\
Trainable params & $<$ 1\% of total \\
Task type & SEQ\_CLS \\
\bottomrule
\end{tabular}
\end{center}
\end{table}'''

# 7. Table VII
table_7 = r'''\begin{table}[htbp]
\caption{Training Hyperparameter Configuration}
\label{tab:hyperparams}
\begin{center}
\resizebox{\columnwidth}{!}{
\begin{tabular}{ll}
\toprule
\textbf{Hyperparameter} & \textbf{Value} \\
\midrule
Batch size (per device) & 4 \\
Gradient accumulation steps & 2 (effective batch = 8) \\
Learning rate & $2 \times 10^{-4}$ \\
Training epochs & 1 \\
Optimizer & Paged AdamW 8-bit \\
Mixed precision & fp16 \\
Gradient checkpointing & Enabled \\
Max sequence length & min(256, max(128, P95 length)) \\
Evaluation strategy & Per epoch \\
\bottomrule
\end{tabular}
}
\end{center}
\end{table}'''

# 8. Table VIII
table_8 = r'''\begin{table}[htbp]
\caption{Aggregate Performance of Fine-Tuned Models on the Combined Bilingual Test Set}
\label{tab:aggregate_results}
\begin{center}
\resizebox{\columnwidth}{!}{
\begin{tabular}{lcccc}
\toprule
\textbf{Model} & \textbf{Overall Acc.} & \textbf{Precision} & \textbf{Recall} & \textbf{F1 (Spam)} \\
\midrule
Qwen2.5-1.5B & 98.31\% & 0.976 & 0.964 & 0.970 \\
StableLM-2-1.6B & 97.97\% & 0.964 & 0.967 & 0.966 \\
TinyLlama-1.1B & 97.76\% & 0.959 & 0.969 & 0.964 \\
Phi-3.5 Mini & 97.49\% & 0.959 & 0.952 & 0.956 \\
SmolLM2-360M & 96.20\% & 0.921 & 0.948 & 0.934 \\
\bottomrule
\end{tabular}
}
\end{center}
\end{table}'''

# 9. Table IX
table_9 = r'''\begin{table*}[htbp]
\caption{Per-Language Performance Breakdown}
\label{tab:lang_results}
\begin{center}
\begin{tabular}{lcccc}
\toprule
\textbf{Model} & \textbf{English Acc.} & \textbf{English F1} & \textbf{Bangla Acc.} & \textbf{Bangla F1} \\
\midrule
Qwen2.5-1.5B & 99.03\% & 0.962 & 94.10\% & 0.955 \\
StableLM-2-1.6B & 99.13\% & 0.969 & 95.24\% & 0.964 \\
TinyLlama-1.1B & 99.03\% & 0.962 & 94.10\% & 0.955 \\
Phi-3.5 Mini & 98.74\% & 0.950 & 94.56\% & 0.958 \\
SmolLM2-360M & 98.26\% & 0.931 & 91.38\% & 0.936 \\
\bottomrule
\end{tabular}
\end{center}
\end{table*}'''

# 10. Table X
table_10 = r'''\begin{table}[htbp]
\caption{Performance Comparison with Prior Works}
\label{tab:comparison}
\begin{center}
\resizebox{\columnwidth}{!}{
\begin{tabular}{llc}
\toprule
\textbf{System (Method)} & \textbf{Language} & \textbf{Max Acc.} \\
\midrule
\textbf{Proposed (QLoRA LLM)} & \textbf{English + Bangla} & \textbf{98.31\%} \\
Talukder et al.~\cite{ref7} (BiLSTM) & Bangla only & 99.00\% \\
SmishGuard~\cite{ref6} & English only & 98.47\% \\
SpamDL~\cite{ref9} & English only & $\sim$98.00\% \\
Hosseinpour \& Das~\cite{ref10} & English (global) & 97.89\% \\
Almeida et al.~\cite{ref1} (SVM) & English only & 97.64\% \\
Goel et al.~\cite{ref5} & English only & 96.20\% \\
\bottomrule
\end{tabular}
}
\end{center}
\end{table}'''

# 11. Table XI
table_11 = r'''\begin{table*}[htbp]
\caption{McNemar's Test Results for Pairwise Model Significance}
\label{tab:mcnemar}
\begin{center}
\begin{tabular}{llcccc}
\toprule
\textbf{Model A} & \textbf{Model B} & \textbf{n\_ci} & \textbf{n\_ic} & \textbf{p-value} & \textbf{Significant?} \\
\midrule
Qwen2.5-1.5B & StableLM-2-1.6B & 18 & 7 & 0.0433 & Yes \\
Qwen2.5-1.5B & TinyLlama-1.1B & 16 & 8 & 0.1516 & No \\
Qwen2.5-1.5B & Phi-3.5 Mini & 19 & 7 & 0.0290 & Yes \\
Qwen2.5-1.5B & SmolLM2-360M & 35 & 4 & $<$0.0001 & Yes \\
StableLM-2-1.6B & TinyLlama-1.1B & 15 & 12 & 0.7011 & No \\
\bottomrule
\end{tabular}
\end{center}
\end{table*}'''

# Confusion Matrix
cm_table = r'''
\begin{center}
\begin{tabular}{r|cc|}
\multicolumn{1}{c}{} & \multicolumn{1}{c}{\textbf{Predicted Ham}} & \multicolumn{1}{c}{\textbf{Predicted Spam}} \\ \cline{2-3}
\textbf{Actual Ham} & TN = 1044 & FP = 10 \\
\textbf{Actual Spam} & FN = 15 & TP = 406 \\ \cline{2-3}
\end{tabular}
\end{center}
'''

# Use regex to replace the markdown tables with latex tables
text = re.sub(r'\\textbf{Table I: Comparative Summary.*?\\textbf{None --- addresses all identified gaps} \\\|', lambda m: table_1, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table II: Dataset Composition Before Preprocessing}.*?template\\_id per record \\\|', lambda m: table_2, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table III: Record Counts After Each Preprocessing Stage}.*?\\-\\{45,\\}', lambda m: table_3, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table IV: Training Set Class Distribution Before and After SMOTE}.*?\\-\\{30,\\}', lambda m: table_4, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table V: Summary of Selected Pretrained LLMs}.*?Transformer \\(compact\\) \\\|', lambda m: table_5, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table VI: QLoRA Hyperparameter Configuration}.*?SEQ\\_CLS \\(Sequence Classification\\) \\\|', lambda m: table_6, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table VII: Training Hyperparameter Configuration}.*?Per epoch \\\|', lambda m: table_7, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table VIII: Aggregate Performance of Fine-Tuned Models on the Combined Bilingual Test Set}.*?\\-\\{50,\\}', lambda m: table_8, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table IX: Per-Language Performance Breakdown}.*?0\.936 \\\|', lambda m: table_9, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table X: Performance Comparison with Prior Works}.*?English only \\\|', lambda m: table_10, text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Table XI: McNemar\'s Test Results for Pairwise Model Significance}.*?No \\\|', lambda m: table_11, text, flags=re.DOTALL)

text = re.sub(r'Predicted Ham\s+Predicted Spam\s*Actual Ham\s*\\\|\s+TN = 1044\s+\\\|\s+FP = 10\s+\\\|\s*Actual Spam\s+\\\|\s+FN = 15\s+\\\|\s+TP = 406\s+\\\|', lambda m: cm_table, text, flags=re.DOTALL)

# Add missing \begin{figure} around figure text instructions
text = re.sub(r'\\textbf{Figure 1:.*?\(Insert confusion matrix heatmap image here --- generated from Section 3.8 of the notebook\)', lambda m: r'\\begin{figure}[htbp]\n\\centering\n% \\includegraphics[width=\\columnwidth]{figures/confusion_matrix.png}\n\\caption{Confusion Matrix for Qwen2.5-1.5B on the Combined Bilingual Test Set}', text, flags=re.DOTALL)
text = text.replace(cm_table, cm_table + '\n\\end{figure}\n')

text = re.sub(r'\\textbf{Figure 2:.*?\(Insert training loss plot image here --- generated from Section 7 of the notebook\)', lambda m: r'\\begin{figure}[htbp]\n\\centering\n% \\includegraphics[width=\\columnwidth]{figures/loss_curve.png}\n\\caption{Training Loss Curve for Qwen2.5-1.5B}\n\\end{figure}', text, flags=re.DOTALL)
text = re.sub(r'\\textbf{Figure 3:.*?\(Insert XAI token importance bar chart images here\)', lambda m: r'\\begin{figure*}[htbp]\n\\centering\n% \\includegraphics[width=\\textwidth]{figures/xai_attention.png}\n\\caption{Token Importance Visualization for Representative Inputs}\n\\end{figure*}', text, flags=re.DOTALL)

with open('latex_journal/main (1).tex', 'w', encoding='utf-8') as f:
    f.write(text)
with open('latex_journal/main.tex', 'w', encoding='utf-8') as f:
    f.write(text)
