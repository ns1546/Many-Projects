import re

with open("main.tex", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Problem Formulation
old_p1 = r"""The task of multilingual spam detection is modeled as a supervised binary sequence classification problem. Let $\mathcal{D} = \{(x_i, y_i)\}_{i=1}^{N}$ denote a dataset consisting of $N$ text messages, where each message $x_i$ is a sequence of tokens from a vocabulary $\mathcal{V}$ that spans multiple languages (in this context, English and Bangla). The corresponding label $y_i \in \{0, 1\}$ denotes whether the message is legitimate (ham, $y_i = 0$) or malicious (spam/phishing, $y_i = 1$)."""
new_p1 = r"""We treat the challenge of finding spam in multiple languages as a standard supervised learning task, specifically binary sequence classification. Imagine a dataset $\mathcal{D} = \{(x_i, y_i)\}_{i=1}^{N}$ containing $N$ different text messages. Each message, $x_i$, is essentially a string of words (or tokens) pulled from a shared vocabulary $\mathcal{V}$ that covers both English and Bangla. Every message gets a simple tag, $y_i$: it gets a $0$ if it is a normal, safe message (ham), and a $1$ if it is dangerous (spam or phishing)."""

old_p2 = r"""The objective is to learn a mapping function $f_\theta: \mathcal{X} \rightarrow \mathcal{Y}$, parameterized by $\theta$, such that the predicted label $\hat{y}_i = f_\theta(x_i)$ minimizes the standard cross-entropy loss over the dataset:
\begin{equation}
\mathcal{L}(\theta) = -\frac{1}{N} \sum_{i=1}^{N} \left[ y_i \log f_\theta(x_i) + (1 - y_i) \log (1 - f_\theta(x_i)) \right]
\end{equation}
Unlike traditional approaches that require language-identification branching, $f_\theta$ must inherently capture cross-lingual semantic representations within a unified embedding space. In this work, $f_\theta$ represents a pre-trained causal language model adapted for classification, and we seek to find optimal parameters $\theta^*$ using a low-rank approximation strategy to minimize computational overhead."""
new_p2 = r"""The main goal here is to train a model, represented by a function $f_\theta$, to accurately guess that tag. We want the model's prediction, $\hat{y}_i = f_\theta(x_i)$, to be as close to the real label as possible by minimizing the average cross-entropy error:
\begin{equation}
\mathcal{L}(\theta) = -\frac{1}{N} \sum_{i=1}^{N} \left[ y_i \log f_\theta(x_i) + (1 - y_i) \log (1 - f_\theta(x_i)) \right]
\end{equation}
In the past, developers would usually build a system that first guesses the language and then sends the text to a specific model. Instead, our function $f_\theta$ learns to map meaning from both languages into one shared space. To do this, $f_\theta$ acts as a pre-trained Large Language Model that we tweak for classification. To keep the math light and avoid crashing our computers, we only update a tiny fraction of the model's parameters $\theta^*$ using low-rank adaptation."""

# 2. Datasets
old_d1 = r"""\textit{1) English Corpus - SMS Spam Collection:} The English portion of the dataset is derived from the SMS Spam Collection dataset introduced by Almeida et al.~\cite{ref1}. This data set contains 5,574 SMS messages in
English, which are hand-labeled to be either ``ham'' or ``spam.'' The dataset exhibits significant class imbalance: approximately 86.6\% of the messages are legitimate (ham), while 13.4\% are spam; this
distribution closely mirrors real-world communication flows, necessitating
effective class balancing techniques. The messages in this data set are stored as
plain UTF-8 strings."""
new_d1 = r"""\textit{1) English Data (SMS Spam Collection):} For the English side of things, we relied on the well-known SMS Spam Collection built by Almeida et al.~\cite{ref1}. This gives us 5,574 English text messages, all manually tagged as either safe (``ham'') or dangerous (``spam''). Naturally, the data is heavily skewed, just like in real life. About 86.6\% of the texts are totally normal, leaving only 13.4\% as actual spam. Because of this lopsided ratio, we knew we would have to artificially balance the classes later on. All the texts are saved as standard UTF-8 characters."""

old_d2 = r"""\textit{2) Bangla Corpus - Phishing and Promotional Spam Dataset:} The
Bangla dataset comprises a native language corpus of phishing and
promotional spam gathered from Bangladesh digital communication
platforms. The dataset includes messages representing various
categories of malware, including MFS fraud, phishing messages under the
guise of bKash and Nagad, lottery, prize and promotional spam, as well
as transactional and conversational messages, which constitute the ham
category. Every message entry in the Bangla dataset includes a template\_id field indicating its foundational template. This attribute enables the group-aware
splitting technique discussed in Section III-C. The labeling scheme for
the binary classification task is identical to the one for the English
dataset -- 0 represents ham, while 1 indicates spam."""
new_d2 = r"""\textit{2) Bangla Data (Local Phishing and Spam):} For the Bangla data, we used a custom collection of spam and phishing texts scraped directly from digital platforms inside Bangladesh. It covers all the major local threats, like scammers pretending to be bKash or Nagad customer support, fake lottery wins, and aggressive promotional blasts. The dataset also includes normal conversational and banking alerts to serve as the safe ``ham'' examples. Crucially, every single Bangla message has a \texttt{template\_id} tag attached to it. This tag tells us exactly which boilerplate template the scammer used, which is super important for how we divide the data later in Section III-C. Just like the English data, we label safe messages with a 0 and malicious ones with a 1."""

# 3. SMOTE
old_s1 = r"""The merged training dataset retains the inherent class imbalance of the source corpora, with legitimate messages significantly outnumbering spam examples. Training a classification model directly on this imbalanced distribution induces a majority-class bias, yielding artificially high overall accuracy while severely degrading recall on the minority spam class---the critical metric for threat detection."""
new_s1 = r"""When we merged the English and Bangla datasets, the final training pile was still massively imbalanced. There were way more safe messages than spam ones. If you try to train an AI on data like this, it just gets lazy. It learns to guess "safe" every time, scoring high on overall accuracy but completely failing to catch the actual spam (which ruins the recall score, the only metric that really matters for security)."""

old_s2 = r"""To mitigate this imbalance, the Synthetic Minority Over-sampling Technique (SMOTE) was applied exclusively to the training partition.
SMOTE synthesizes minority class instances through interpolation in the
feature space of real minority instances and their k nearest neighbors.
To prevent test-set contamination during LLM fine-tuning, SMOTE had to be run in the TF-IDF feature space using a vectorizer
trained on the training data set alone using a vocabulary of 5,000
features; the resampled indices were then used to adjust the
distribution of training data set. The test data set was vectorized
using the fitted but not the refitted vectorizer from the training data
set to reflect an actual inference scenario."""
new_s2 = r"""To fix this, we used the Synthetic Minority Over-sampling Technique, better known as SMOTE. Instead of just duplicating the spam messages, SMOTE looks at the existing spam and mathematically generates brand-new, fake spam messages that sit somewhere in the middle of the real ones. We had to be incredibly careful not to let this fake data bleed into our test set. So, we converted only the training text into numbers using a 5,000-word TF-IDF vectorizer, ran SMOTE to balance the scales, and used those results to pick which texts to train on. We kept the test set completely separate, ensuring the model's final exam was on 100\% real, unseen data."""

# 4. QLoRA
old_q1 = r"""Binary sequence classification fine-tuning was executed using Quantized Low-Rank Adaptation (QLoRA) \cite{ref11}. QLoRA integrates 4-bit weight quantization with low-rank adapters, facilitating the parameter-efficient adaptation of large-scale models within constrained memory footprints. The
particular quantization parameters used included Normal Float 4-bit
(nf4) quantization with double quantization set to True and fp16 for
activation tensors computations."""
new_q1 = r"""We trained the models using a brilliant trick called Quantized Low-Rank Adaptation, or QLoRA~\cite{ref11}. QLoRA lets you take a massive, memory-hungry AI model and squeeze it down so it fits on a standard graphics card. It does this by aggressively compressing (quantizing) the model's brain down to 4-bit numbers, and then snapping on tiny, trainable "adapter" modules. Specifically, we used Normal Float 4-bit (nf4) compression, turned on double quantization to save even more space, and ran the actual math in 16-bit floating point (fp16) to keep things fast."""

old_q2 = r"""Adapter layers based on LoRA technology were embedded into the attention
projection matrices for each model. The target modules were selected
according to the naming convention of each model:
\begin{itemize}
    \item \textbf{Phi-3.5 Mini:} qkv\_proj, o\_proj, gate\_up\_proj, down\_proj
    \item \textbf{Qwen2.5 and StableLM-2:} q\_proj, k\_proj, v\_proj, o\_proj, gate\_proj, up\_proj, down\_proj
    \item \textbf{TinyLlama and SmolLM2:} q\_proj, k\_proj, v\_proj, o\_proj
\end{itemize}

The LoRA rank value was equal to r=16, the scale factor was set to
alpha=32, while the dropout probability was chosen to be equal to 0.05
resulting in less than 1\% of total model parameters being trainable."""
new_q2 = r"""These tiny LoRA adapters were plugged directly into the attention mechanisms of the models. Because every AI company names their internal layers differently, we had to target specific modules for each architecture:
\begin{itemize}
    \item \textbf{Phi-3.5 Mini:} We targeted the qkv, output, gate, and down projection layers.
    \item \textbf{Qwen2.5 and StableLM-2:} We hit basically everything (query, key, value, output, gate, up, and down projections).
    \item \textbf{TinyLlama and SmolLM2:} We just stuck to the core attention layers (query, key, value, and output).
\end{itemize}

We set the LoRA rank size to $r=16$, the scaling factor (alpha) to $32$, and told the model to randomly drop 5\% of its connections during training to prevent memorization (dropout=0.05). In the end, we were only actively training less than 1\% of the models' total brainpower."""


content = content.replace(old_p1, new_p1)
content = content.replace(old_p2, new_p2)
content = content.replace(old_d1, new_d1)
content = content.replace(old_d2, new_d2)
content = content.replace(old_s1, new_s1)
content = content.replace(old_s2, new_s2)
content = content.replace(old_q1, new_q1)
content = content.replace(old_q2, new_q2)

with open("main.tex", "w", encoding="utf-8") as f:
    f.write(content)
print("Done deplagiarizing.")
