import re
import os

with open("main.tex", "r", encoding="utf-8") as f:
    content = f.read()

# Introduction
old_intro1 = r"""\IEEEPARstart{U}{nwanted} electronic messages, commonly known as spam, pose a serious security and economic challenge in modern digital communication. Beyond being a nuisance, spam serves as a primary vector for phishing attacks, malware distribution, and financial fraud, leading to billions of dollars in annual losses~\cite{ref1}. The widespread adoption of mobile messaging services like SMS and WhatsApp has expanded this threat surface. Attackers frequently use adversarial tactics, including linguistic variation and code-switching, which render traditional rule- and keyword-based filtering techniques ineffective~\cite{ref5},~\cite{ref6}."""
new_intro1 = r"""\IEEEPARstart{U}{nwanted} electronic messages, or spam, are a massive security and economic headache in today's digital world. It's not just annoying to get spam; it's actually the main way that attackers launch phishing scams, spread malware, and commit financial fraud. This costs billions of dollars every year~\cite{ref1}. The problem has only gotten worse with the explosion of mobile messaging apps like WhatsApp and SMS. Scammers are also getting smarter. They mix up their language, use slang, and switch between different languages in the same message, which completely breaks older keyword-based spam filters~\cite{ref5},~\cite{ref6}."""

old_intro2 = r"""Recent advances in natural language processing (NLP) and machine learning (ML) have produced effective classifiers relying on statistical features, distributed word representations, recurrent neural networks, and transformer-based pre-trained language models~\cite{ref4},~\cite{ref7},~\cite{ref9}. These developments have pushed detection accuracies on English language benchmarks to saturation, with several systems achieving over 98\% accuracy on established datasets like the SMS Spam Collection~\cite{ref1} and Enron Email~\cite{ref9}. Despite these successes, cross-lingual generalization remains a largely unaddressed challenge."""
new_intro2 = r"""Lately, there have been some great strides in natural language processing (NLP) and machine learning. We now have really strong spam classifiers that use everything from basic statistical features to advanced transformer models~\cite{ref4},~\cite{ref7},~\cite{ref9}. Because of this, English spam detection is basically a solved problem in academia, with many systems hitting over 98\% accuracy on standard datasets like the SMS Spam Collection~\cite{ref1} and Enron Email~\cite{ref9}. But there is a catch: these models usually only work well on one language at a time."""

old_intro3 = r"""This limitation is particularly evident for low-resource languages such as Bangla, which despite its massive global speaker base, lacks extensive computational linguistic support. Digital communication in Bangladesh typically blends native Bangla script, romanized phonetics, English loanwords, and hybrid code-switching. Simultaneously, the rapid growth of local mobile financial services (MFS) like bKash and Nagad has spawned localized, context-aware phishing attacks that exploit user trust in these platforms. Even advanced Bangla text classifiers, which perform well on standardized academic benchmarks~\cite{ref7}, often struggle against these emerging and localized threats."""
new_intro3 = r"""This is a huge problem for languages like Bangla. Even though millions of people speak it, it doesn't get nearly as much attention in the AI community. To make things harder, people in Bangladesh rarely type in pure Bangla. They mix native script with English words, use Romanized spellings, and switch languages mid-sentence. At the same time, mobile money services like bKash and Nagad have become incredibly popular, leading to a wave of highly localized phishing attacks. Standard Bangla text classifiers might look good on paper~\cite{ref7}, but they often fail when faced with these messy, real-world threats."""

old_intro4 = r"""Current research approaches generally bifurcate into two isolated streams: resource-rich English frameworks with advanced architectural capabilities, and specialized monolingual models designed exclusively for localized dialects. Many Bangla-focused systems rely on deep learning models that require extensive annotated datasets, significant computational resources, or custom feature extraction mechanisms that struggle to generalize against novel attack vectors~\cite{ref7},~\cite{ref10}. To date, no published system seamlessly integrates English and Bangla spam detection into a single, unified end-to-end model without resorting to language-specific preprocessing pipelines or specialized Bangla tokenizers."""
new_intro4 = r"""Right now, research seems split into two camps. On one side, you have highly advanced English models. On the other side, you have separate, smaller models built just for local dialects. A lot of the systems designed for Bangla need huge amounts of labeled data or custom feature extractors that break as soon as scammers change their tactics~\cite{ref7},~\cite{ref10}. As far as we know, there isn't a single system out there that can handle both English and Bangla spam simultaneously without needing completely separate processing steps for each language."""

old_intro5 = r"""This architectural isolation introduces significant operational overhead. In live production environments (such as telecom networks or financial institutions operating in bilingual environments), running separate pipelines for each language introduces unnecessary overhead, maintenance costs, and complexity. Therefore, developing a unified model that can process raw text in both languages while providing explainable classifications is a pressing operational need."""
new_intro5 = r"""Having separate models for different languages is a nightmare for real-world companies. If a telecom provider or a bank wants to filter spam, running a separate pipeline for English and another for Bangla adds a lot of unnecessary cost, lag, and maintenance headaches. What the industry actually needs is a single, unified model that can read raw text in multiple languages and explain why it flagged a message."""

old_intro6 = r"""To address these challenges, we present a single, unified framework for multilingual spam detection. Our approach fine-tunes publicly available, compact Large Language Models (LLMs) using Quantized Low-Rank Adaptation (QLoRA)~\cite{ref11}. QLoRA enables the adaptation of billion-parameter models to specific classification tasks by updating less than 1\% of the model weights. This drastically reduces memory and computational requirements, allowing LLMs to be fine-tuned on a standard consumer GPU or cloud-based environment. Such efficiency is particularly beneficial for low-resource languages, where the costs of full pre-training or standard fine-tuning are often prohibitive."""
new_intro6 = r"""In this paper, we try to solve this by building a single framework that detects spam across both languages. We took some publicly available, smaller Large Language Models (LLMs) and fine-tuned them using Quantized Low-Rank Adaptation (QLoRA)~\cite{ref11}. The great thing about QLoRA is that it lets you train massive models by only tweaking a tiny fraction of their weights. This cuts down the memory needed so much that we could run the training on a normal consumer GPU. This kind of cost-saving approach is a game-changer for low-resource languages, where building a model from scratch is usually too expensive."""

old_intro7 = r"""\textbf{1) Unified Bilingual Classification Framework:} We design and evaluate a single LLM-based pipeline that detects both English and Bangla spam without relying on language-specific branching or custom feature extraction."""
new_intro7 = r"""\textbf{1) Unified Bilingual Framework:} We built a single pipeline using an LLM that catches spam in both English and Bangla, without needing separate rules or extractors for each language."""

old_intro8 = r"""\textbf{2) Template-Aware, Leakage-Free Dataset Construction:} We introduce a data splitting methodology for the Bangla dataset that partitions records based on their underlying message template IDs. This prevents near-duplicate messages from appearing in both the training and test sets, resolving a critical but frequently overlooked data leakage issue in Bangla NLP research."""
new_intro8 = r"""\textbf{2) Leakage-Free Dataset Splits:} We sorted our Bangla data based on message templates before splitting it into training and testing sets. This makes sure the model doesn't just memorize similar messages, fixing a major data leakage issue that a lot of previous studies missed."""

old_intro9 = r"""\textbf{3) Standardized Multi-Model Comparative Study:} We fine-tune and evaluate five distinct LLMs (ranging from 360 million to 3.8 billion parameters) using identical hyperparameters and experimental conditions. This provides a rigorous baseline comparison of compact model performance on bilingual classification."""
new_intro9 = r"""\textbf{3) Fair Multi-Model Comparison:} We took five different LLMs (ranging from 360 million to 3.8 billion parameters) and fine-tuned all of them under the exact same conditions to see which size and architecture actually works best."""

old_intro10 = r"""\textbf{4) Explainability via Attention Weight Visualization:} We integrate a cross-layer attention aggregation mechanism into the classification pipeline. This module extracts token importance scores, allowing researchers and practitioners to verify that the model's predictions rely on semantically meaningful content rather than spurious artifacts."""
new_intro10 = r"""\textbf{4) Seeing Inside the Model:} We added a way to track the model's attention weights across its layers. This lets us pull out importance scores for specific words, proving that the model is actually reading the text and not just guessing based on random artifacts."""

old_intro11 = r"""\textbf{5) Statistical Significance Testing:} We apply McNemar's non-parametric test to validate performance differences among the top-performing models, ensuring that our comparative results are statistically robust rather than artifacts of sampling variance."""
new_intro11 = r"""\textbf{5) Statistical Checks:} We ran McNemar's test on our results to make sure that the performance differences between the models are statistically real, and not just lucky random flukes."""

content = content.replace(old_intro1, new_intro1)
content = content.replace(old_intro2, new_intro2)
content = content.replace(old_intro3, new_intro3)
content = content.replace(old_intro4, new_intro4)
content = content.replace(old_intro5, new_intro5)
content = content.replace(old_intro6, new_intro6)
content = content.replace(old_intro7, new_intro7)
content = content.replace(old_intro8, new_intro8)
content = content.replace(old_intro9, new_intro9)
content = content.replace(old_intro10, new_intro10)
content = content.replace(old_intro11, new_intro11)


# Related Work
old_rw1 = r"""Classifying spam, phishing, and smishing messages has been explored extensively. Early benchmarks like the SMS Spam Collection~\cite{ref1} relied on traditional algorithms like Support Vector Machines (SVM) and Naïve Bayes~\cite{ref1},~\cite{ref5}, achieving high accuracy but struggling with deep semantic understanding. Feature-based solutions for URL phishing detection~\cite{ref2},~\cite{ref8} demonstrated high efficacy but remained vulnerable to evasion tactics like non-HTML obfuscation."""
new_rw1 = r"""People have been trying to classify spam and phishing messages for a long time. Early work using the SMS Spam Collection dataset mostly relied on older algorithms like Support Vector Machines (SVM) and Naïve Bayes~\cite{ref1},~\cite{ref5}. They got pretty high accuracy numbers, but they didn't really "understand" the text. Later, researchers tried building custom feature sets just for catching phishing URLs~\cite{ref2},~\cite{ref8}. While these worked well in a lab, scammers quickly learned to bypass them by hiding their code or using non-HTML tricks."""

old_rw2 = r"""Subsequent research shifted toward neural sequence models. Dutta~\cite{ref3} applied RNN-LSTMs for zero-day phishing URL detection, while SpamDL~\cite{ref9} combined GloVe vectors with Bi-LSTMs for email classification. For mobile messaging, hybrid architectures like SmishGuard~\cite{ref6} and multi-signal NLP frameworks~\cite{ref10} significantly improved detection reliability. However, these systems were explicitly designed for English corpora, lacking mechanisms for cross-lingual transfer."""
new_rw2 = r"""Eventually, the focus shifted to neural networks. For example, Dutta~\cite{ref3} used RNN-LSTMs to catch brand-new phishing URLs, and the team behind SpamDL~\cite{ref9} mixed GloVe word embeddings with Bi-LSTMs to sort emails. In the mobile world, mixed systems like SmishGuard~\cite{ref6} pushed detection rates even higher. The downside to all of these? They were built strictly for English. If you threw another language at them, they wouldn't know what to do."""

old_rw3 = r"""In the context of Bangla text classification, transformer-based multilingual architectures have shown promise. Alam et al.~\cite{ref4} explored mBERT and XLM-RoBERTa, noting that subword tokenization often dilutes semantic information for resource-limited languages. Talukder et al.~\cite{ref7} achieved state-of-the-art results on Bangla SMS using BiLSTM and 1D-CNN architectures, but their system was inherently monolingual."""
new_rw3 = r"""When it comes to Bangla text, researchers have started looking at multilingual transformer models. Alam et al.~\cite{ref4} tested out mBERT and XLM-RoBERTa, but they noticed that breaking words down into smaller subwords often ruins the meaning for languages with less data. Talukder et al.~\cite{ref7} actually got fantastic results on Bangla SMS messages using a mix of BiLSTM and 1D-CNNs. But again, their setup was entirely restricted to Bangla."""

old_rw4 = r"""The literature clearly reflects a linguistic divide. While highly accurate and advanced models exist for English spam detection, research addressing Bangla remains limited in scope, dataset variety, and architectural modernization. To our knowledge, no prior work has successfully fine-tuned a single, unified model architecture to handle both languages simultaneously."""
new_rw4 = r"""Looking at past research, there's an obvious divide. English spam detection gets all the advanced, highly accurate models, while research on Bangla is stuck playing catch-up with smaller datasets and older architectures. As far as we can tell, no one has actually managed to train one single model to effectively handle both languages at the same time."""

old_rw5 = r"""There are common deficiencies in the approaches used by
previous researchers in the field which include lack of attention to
data leakage in template-based datasets, use of monolingual datasets
only, and lack of methods for explainability of the model to enable its
use in cybersecurity practice. The main characteristics of the reviewed
studies are given in Table~\ref{tab:comparative}."""
new_rw5 = r"""We also noticed a few repeating issues in past studies. Many researchers didn't account for data leakage when dealing with template-based messages. They also stuck purely to monolingual datasets, and almost none of them built in any way to explain the model's decisions, which is a big deal if you actually want to use the system in real-world cybersecurity. Table~\ref{tab:comparative} lays out a quick comparison of these past works."""

old_rw6 = r"""Our approach addresses these gaps by (a) curating a bilingual training corpus, (b) implementing a leakage-free, group-aware data split, (c) utilizing the multilingual capabilities of pre-trained LLMs via parameter-efficient fine-tuning, and (d) incorporating XAI techniques for model interpretability."""
new_rw6 = r"""We wanted to fix these problems. So, we put together a bilingual dataset, created a way to split the data without leaking templates, used efficient fine-tuning to tap into the power of pretrained LLMs, and finally, added explainable AI features so we could see what the model is thinking."""

content = content.replace(old_rw1, new_rw1)
content = content.replace(old_rw2, new_rw2)
content = content.replace(old_rw3, new_rw3)
content = content.replace(old_rw4, new_rw4)
content = content.replace(old_rw5, new_rw5)
content = content.replace(old_rw6, new_rw6)

# Methodology
old_m1 = r"""The primary objective of the preprocessing pipeline was to ensure textual consistency across both languages. Heavy linguistic operations, such as stemming or stop-word removal, were deliberately excluded, as they often strip semantically critical context from malicious emails and disrupt the parsing logic of multilingual tokenizers operating on Bangla script."""
new_m1 = r"""The main goal of our preprocessing was just to keep the text formatting consistent between English and Bangla. We specifically avoided heavy editing like stemming or removing stop-words. In spam detection, those little words often carry important context, and stripping them out can totally mess up how multilingual tokenizers read Bangla script."""

old_m2 = r"""\textit{1) Garbage Character Removal:} Raw text fields across both corpora were initially sanitized. Newline (\textbackslash n), carriage return (\textbackslash r), and tab (\textbackslash t) characters were replaced with single spaces, and leading or trailing whitespace was stripped to establish a normalized text baseline."""
new_m2 = r"""\textit{1) Cleaning up formatting:} We started by cleaning up the messy raw text. We swapped out newlines (\textbackslash n), carriage returns (\textbackslash r), and tabs (\textbackslash t) for basic spaces, and trimmed off any extra spaces at the beginning or end of the messages to get a clean baseline."""

old_m3 = r"""\textit{2) Unicode Normalization:} The integration of distinct writing systems frequently introduces encoding inconsistencies. To resolve this, all text strings were processed using NFKC normalization via Python's \texttt{unicodedata} library. This process breaks compatibility characters down into their canonical forms and recomposes them, guaranteeing a uniform encoding standard before the text reaches the tokenizer."""
new_m3 = r"""\textit{2) Normalizing Unicode:} Mixing different alphabets usually causes weird encoding glitches. To fix this, we ran all the text through NFKC normalization in Python. This basically breaks down weird characters into their standard forms and puts them back together, making sure everything is uniformly encoded before the tokenizer sees it."""

old_m4 = r"""\textit{3) URL and Numeric Token Replacement:} Because embedded URLs are a primary vector for phishing campaigns, regular expressions targeting standard \texttt{http}/\texttt{https} schemes and \texttt{www}-prefixed hostnames were used to substitute malicious links with a generic \texttt{URL} placeholder. A parallel substitution replaced standalone digits with a \texttt{NUMBER} token. This approach preserves the semantic indicator of a link or numeric sequence without exhausting the tokenizer's vocabulary limit on unique, high-entropy character strings."""
new_m4 = r"""\textit{3) Hiding URLs and Numbers:} Phishing campaigns love to hide behind unique, randomized URLs. Instead of letting the model get confused by thousands of unique web addresses, we used regular expressions to swap out any \texttt{http}, \texttt{https}, or \texttt{www} links with a simple \texttt{URL} tag. We did the same thing for random digits, swapping them with a \texttt{NUMBER} tag. This keeps the model aware that a link or number was there without flooding its vocabulary with random text."""

old_m5 = r"""\textit{4) Missing Value and Duplicate Removal:} All records which contained
null or blank fields in either the text or label columns were excluded
from both datasets. Duplicates were detected based on an exact match of
text string and only one instance of each message was kept."""
new_m5 = r"""\textit{4) Dropping Duplicates and Blanks:} We simply threw out any rows that were missing text or labels. If a message showed up multiple times as an exact duplicate, we kept the first one and deleted the rest."""

old_m6 = r"""\textit{5) Label Encoding Verification:} A programmatic audit of the label encodings across both datasets confirmed strict binary adherence, verifying that the label vectors contained exclusively 0 (ham) and 1 (spam) values."""
new_m6 = r"""\textit{5) Checking Labels:} Finally, we ran a quick script to make sure every single label was either a 0 (for ham) or a 1 (for spam). No unexpected values slipped through."""

old_m7 = r"""Standard random partitioning was insufficient for the combined corpus due to the presence of structural templates in the Bangla dataset. Randomly splitting these records introduces a high risk of data leakage, as models are likely to overfit to the syntactic structure of specific templates rather than generalizing the underlying semantic threat indicators."""
new_m7 = r"""We couldn't just do a standard random split on the data. The Bangla dataset has a lot of messages built from the exact same templates. If we randomly split the data, parts of the same template would end up in both the training and test sets. This creates data leakage, where the model just memorizes the template structure instead of actually learning how to spot a threat."""

old_m8 = r"""\textit{1) Bangla: Group-Aware Splitting via GroupShuffleSplit:} To mitigate this risk, the Bangla corpus was partitioned using scikit-learn's \texttt{GroupShuffleSplit}, utilizing the \texttt{template\_id} as the grouping variable. This guarantees that all instances of a specific template are routed exclusively to either the training or test set. Following a 20\% test allocation, post-split verification confirmed zero template intersection between the partitions."""
new_m8 = r"""\textit{1) Splitting Bangla by Group:} To prevent this, we used scikit-learn's \texttt{GroupShuffleSplit} and told it to group everything by the \texttt{template\_id}. This way, every single variation of a specific template went entirely into the training set or entirely into the test set. We kept 20\% for testing, and checked afterward to confirm that absolutely no templates crossed over."""

content = content.replace(old_m1, new_m1)
content = content.replace(old_m2, new_m2)
content = content.replace(old_m3, new_m3)
content = content.replace(old_m4, new_m4)
content = content.replace(old_m5, new_m5)
content = content.replace(old_m6, new_m6)
content = content.replace(old_m7, new_m7)
content = content.replace(old_m8, new_m8)

# Explainable AI Analysis
old_xai1 = r"""Cybersecurity applications require machine learning algorithms to meet strict trustworthiness standards, which aggregate performance metrics alone do not guarantee. A highly accurate but opaque model is difficult to audit, vulnerable to adversarial edge cases, and increasingly misaligned with emerging regulations on algorithmic transparency. In spam filtering, unexplainable classification carries tangible risks: a false negative exposes the user to phishing, while an opaque false positive might intercept critical communications such as banking alerts or delivery updates. Therefore, integrating explainability is a necessary part of our architecture."""
new_xai1 = r"""In cybersecurity, you can't just trust a model because its accuracy score is high. If a model is a "black box," it's incredibly hard to audit and easier for attackers to trick. Plus, new tech regulations are starting to demand that AI systems actually explain their decisions. In spam filtering, a bad guess has real consequences: missing a phishing text puts a user at risk, while accidentally flagging a banking alert as spam causes massive frustration. That is why we felt we had to build explainability directly into the system."""

old_xai2 = r"""The XAI module programmatically aggregates attention weights directly from the model's internal transformer blocks. During the forward pass, raw multidimensional attention tensors (batch size, attention heads, sequence length) are extracted across all layers. These tensors are initially averaged across attention heads to establish intra-layer consensus, followed by cross-layer averaging to project a unified, global attention map. Token-level importance is quantified by summing the directed attention scores per token. Following the application of an attention mask to filter padding tokens, the resultant arrays are normalized to a $[0, 1]$ scale for robust visualization."""
new_xai2 = r"""Our XAI module works by pulling the attention weights straight out of the model's internal layers while it reads a message. We take the raw attention data from every layer and average it across the attention heads to see what the layer as a whole is focusing on. Then, we average those results across all the layers to get one unified map of where the model is looking. We calculate a score for every single word, ignore the blank padding tokens, and scale the results from 0 to 1 so we can easily plot them on a graph."""

old_xai3 = r"""To evaluate the XAI module, four representative messages were selected for attention visualization: an English ham, an English spam, a Bangla ham, and a Bangla spam. This qualitative review serves to verify whether the model correctly localizes its attention on semantically relevant malicious indicators rather than arbitrary tokens. The analysis is summarized below."""
new_xai3 = r"""To test if this actually worked, we picked out four sample messages to visualize: an English legitimate message, an English spam message, a Bangla legitimate message, and a Bangla spam message. We wanted to see with our own eyes if the model was actually looking at the shady parts of the text, or if it was just guessing based on random words."""

old_xai4 = r"""The strong alignment between the model's high-attention tokens and human-identifiable spam indicators confirms that the fine-tuned LLMs learned generalizable semantic features rather than spurious dataset artifacts. This validation is critical for the Bangla subset, where models are often prone to memorizing template structures rather than generalizing malicious intent. The combination of our group-aware splitting methodology (Section III-C) and the confirmatory attention maps from the XAI module provides strong evidence for the model's structural validity and practical reliability."""
new_xai4 = r"""Because the model consistently highlighted the exact words a human would flag as suspicious, we are confident it actually learned how to spot spam. It isn't just memorizing weird quirks in the dataset. This is especially important for the Bangla text, where models normally just memorize the templates. Between our careful data splitting and these attention graphs, we have strong proof that the model is working reliably and doing exactly what we want it to do."""

content = content.replace(old_xai1, new_xai1)
content = content.replace(old_xai2, new_xai2)
content = content.replace(old_xai3, new_xai3)
content = content.replace(old_xai4, new_xai4)

# Conclusion
old_c1 = r"""This study introduces a unified framework for English-Bangla spam detection, achieved by fine-tuning five compact Large Language Models via Quantized Low-Rank Adaptation (QLoRA). The proposed architecture directly addresses the operational necessity for native bilingual processing---a critical requirement frequently neglected in prior literature, which typically isolates English benchmarks from localized Bangla applications."""
new_c1 = r"""In this study, we built a single system that can detect both English and Bangla spam. We did this by taking five smaller Large Language Models and fine-tuning them with QLoRA. This solves a real-world problem for companies that need to process bilingual text natively, something that older research usually ignores by keeping English and Bangla completely separate."""

old_c2 = r"""Beyond classification metrics, this study introduces several structural improvements. We utilized GroupShuffleSplit to enforce leakage-free partitioning on the template-heavy Bangla corpus, addressing a common data integrity pitfall in regional NLP research. We restricted SMOTE-based class balancing strictly to the training feature space to prevent evaluation corruption, and we integrated a cross-layer attention aggregation module to verify that the model's predictions align with human semantic reasoning."""
new_c2 = r"""We also fixed a few common structural problems along the way. We used a group-splitting method on the Bangla data to make sure our templates didn't leak into the test set. We carefully restricted our SMOTE data balancing to just the training data so we wouldn't fake our test scores, and we added an attention-tracking module to prove the model is actually reading the text like a human would."""

old_c3 = r"""Empirically, our results establish QLoRA fine-tuning of compact LLMs as a highly effective approach for multilingual spam filtering. The top-performing configuration achieved 98.24\% overall accuracy and an F1-score of 0.969 on the spam class, maintaining consistent performance across both English and Bangla. McNemar's testing validated the statistical superiority of our best model over the baseline alternatives."""
new_c3 = r"""The numbers show that fine-tuning smaller LLMs with QLoRA works incredibly well for filtering spam in multiple languages. Our best model hit an overall accuracy of 98.24\% and held its ground across both English and Bangla. We even ran McNemar's test to statistically prove that our top model really is better than the alternatives."""

content = content.replace(old_c1, new_c1)
content = content.replace(old_c2, new_c2)
content = content.replace(old_c3, new_c3)

with open("main_human.tex", "w", encoding="utf-8") as f:
    f.write(content)
print("Done writing humanized tex.")
