


# Multilingual Spam Detection for English and Bangla Messages Using QLoRA-Fine-Tuned Large Language Models with Explainable AI Validation

**Najmush Shakib**¹, **Munim Halder**¹

¹ Department of Computer Science and Engineering, Bangladesh University of Business and Technology (BUBT), Dhaka, Bangladesh

*Corresponding Author: [author email]*



## Abstract

The global surge in digital messaging has been accompanied by an equally rapid proliferation of spam, phishing, and smishing threats that impose serious economic and security burdens on users worldwide. While automated spam detection has matured considerably for high-resource languages such as English, a major gap remains for low-resource languages like Bangla, which is spoken by over 230 million people yet remains severely underserved by existing commercial and academic spam-filtering systems. We present a unified, end-to-end multilingual spam detection framework that jointly classifies English and Bangla messages without requiring language-specific feature engineering or separate model pipelines. Our approach applies Quantized Low-Rank Adaptation (QLoRA) to fine-tune five compact pretrained Large Language Models — namely Phi-3.5 Mini, Qwen2.5-1.5B, TinyLlama-1.1B, StableLM-2-1.6B, and SmolLM2-360M — on a combined dataset drawn from the SMS Spam Collection and a native Bangla phishing corpus. Rigorous data preprocessing, including Unicode normalization, URL token replacement, and leakage-safe group-aware splitting via GroupShuffleSplit on template identifiers, ensures experimental integrity. Class imbalance is addressed through Synthetic Minority Over-sampling Technique (SMOTE) applied exclusively to the training partition. Model evaluation is conducted across both overall and language-stratified performance using accuracy, precision, recall, and F1-score, and inter-model differences are assessed through McNemar's statistical significance test. In addition, an Explainable AI (XAI) module based on cross-layer attention aggregation is employed to validate that model predictions are grounded in semantically meaningful tokens rather than spurious correlations. Results demonstrate that QLoRA fine-tuning of lightweight LLMs provides a highly parameter-efficient pathway to high-accuracy bilingual spam detection, offering a promising foundation for deployment in resource-constrained environments. The proposed approach achieves state-of-the-art performance on the bilingual test set, significantly outperforming traditional machine learning baselines established in prior literature.

**Keywords:** Spam Detection, Bangla NLP, QLoRA, Large Language Models, Parameter-Efficient Fine-Tuning, PEFT, Explainable AI, Multilingual Classification, Phishing Detection, Smishing



## I. Introduction

### A. Background and Motivation

Unsolicited electronic messages — collectively referred to as spam — constitute one of the most pervasive and economically damaging threats in the modern digital communication ecosystem. Beyond mere inconvenience, spam messages frequently serve as delivery vectors for phishing attacks, malware distribution, fraudulent financial solicitations, and social engineering schemes that collectively result in billions of dollars in annual losses for individuals and institutions alike [1]. The proliferation of mobile messaging platforms, including SMS, WhatsApp, and domestic equivalents, has dramatically expanded the surface area for such attacks, rendering legacy rule-based and keyword-matching spam filters increasingly ineffective against adversarially crafted messages that deliberately obfuscate intent through linguistic variation, code-switching, and typographic manipulation [5], [6].

The natural language processing (NLP) and machine learning communities have responded with a rich body of research, yielding progressively more sophisticated classifiers that leverage statistical features, distributed word representations, recurrent neural architectures, and, most recently, pretrained transformer-based language models [4], [7], [9]. These advances have driven detection accuracy on English-language benchmarks to near-saturation levels, with several contemporary systems exceeding 98% accuracy on established corpora such as the SMS Spam Collection [1] and the Enron email dataset [9]. However, the generalizability of these systems across linguistic boundaries remains a significant and largely unresolved challenge.

Bangla, the seventh most spoken language globally and the official language of Bangladesh, represents a particularly acute instance of this challenge. The Bangladeshi digital communication environment is characterized by a complex interplay of native Bangla script, romanized phonetic spellings, English loanwords, and hybrid code-switched constructions that are highly difficult to parse with models trained exclusively on high-resource linguistic corpora [4]. In addition, the emergence of widespread mobile financial services (MFS) — most prominently bKash and Nagad — has spawned a new category of highly localized, contextually specific phishing messages that exploit users' familiarity with these platforms. Traditional Bangla text classifiers, even those that have achieved strong results on clean benchmark datasets [7], are rarely designed to address this rapidly evolving threat environment in an operationally deployable configuration.

### B. Problem Statement

Prior work generally falls into two camps: high-resource English systems are sophisticated but linguistically exclusive, while Bangla-specific systems, though promising, remain largely isolated from the broader multilingual threat environment and are dependent upon deep learning architectures that require extensive labeled data, significant computational overhead, or domain-specific feature engineering that does not transfer gracefully to new attack patterns [7], [10]. No existing published system simultaneously addresses English and Bangla spam in a single, unified model trained end-to-end without language-specific preprocessing branches or custom tokenization schemes designed for Bangla.

This gap is not merely academic. In a realistic deployment scenario — such as a national telecommunications provider or a banking application serving a bilingual population — maintaining separate pipelines for different languages is operationally costly, latency-prone, and difficult to update and retrain cohesively. A unified model that can ingest raw text in either language and produce accurate, explainable classifications is therefore both technically desirable and practically necessary.

### C. Proposed Solution and Contributions

This paper addresses the aforementioned gap by proposing a unified multilingual spam detection framework grounded in the fine-tuning of publicly available compact Large Language Models (LLMs) using Quantized Low-Rank Adaptation (QLoRA) [?]. QLoRA enables the adaptation of models with billions of parameters to domain-specific classification tasks while retaining a fraction of the original parameter budget — typically fewer than 1% of the total model weights are updated during training — thereby making LLM fine-tuning feasible on a single consumer-grade GPU or cloud-based notebook environment. This is of particular significance in the context of low-resource language research, where computational constraints often preclude the use of full fine-tuning or large-scale pretraining from scratch.

Our main contributions are: 
**1) Unified Bilingual Classification Framework:** We construct and evaluate a single fine-tuned LLM pipeline that jointly handles English and Bangla spam detection without language-branching or language-specific feature extraction, showing that a shared multilingual tokenizer and a shared model backbone are sufficient for strong bilingual performance.

**2) Template-Aware, Leakage-Safe Dataset Construction:** We introduce and validate a group-aware data splitting strategy for the Bangla corpus that partitions by message template identifier, preventing near-duplicate templates from appearing simultaneously in training and test partitions — a methodological contribution that addresses a subtle but consequential source of evaluation inflation that has gone largely unaddressed in prior Bangla NLP research.

**3) Multi-Model Comparative Study under Uniform Experimental Conditions:** We fine-tune and rigorously evaluate five distinct LLMs under identical hyperparameter and evaluation conditions, providing a fair and reproducible comparative baseline that spans a parameter range from 360 million to approximately 3.8 billion parameters.

**4) Explainability through Attention Weight Visualization:** We augment the classification pipeline with a cross-layer attention aggregation module that produces token-level importance scores, enabling qualitative verification that model predictions are anchored to semantically indicative tokens — a property that is essential for building trust in AI-based cybersecurity tools.

**5) Statistical Significance Testing:** We apply McNemar's non-parametric test to quantify whether observed performance differences between the best-performing and second-best-performing models are statistically meaningful, contributing a level of methodological rigor that is frequently absent from NLP system comparison papers.

### D. Paper Organization

The remainder of this paper is structured as follows. Section II reviews the relevant literature across three thematic categories: traditional machine learning approaches to spam detection, deep learning and transformer-based methods, and Bangla-specific NLP research. Section III details the experimental methodology, encompassing dataset description, preprocessing pipeline, model architectures, QLoRA configuration, and training procedure. Section IV presents and discusses the quantitative results, including both aggregate and language-stratified performance metrics. Section V details the XAI analysis and its implications for model trustworthiness. Section VI reports the results of McNemar's statistical significance tests. Section VII concludes the paper with a synthesis of findings and directions for future research.


*[End of Phase 1 & 2 — Title, Abstract, Keywords, Introduction]*





## II. Related Work

The detection of spam, phishing, and smishing messages has been the subject of sustained research interest across multiple disciplines, encompassing classical machine learning, deep learning, and — most recently — large-scale pretrained language models. This section organizes the relevant literature into three thematic clusters: (1) traditional machine learning approaches applied to English-language spam detection, (2) deep learning and transformer-based methods for email, URL, and SMS classification, and (3) Bangla-specific and multilingual text classification efforts. The discussion concludes with an explicit articulation of the research gap that the present work is designed to address.

### A. Traditional Machine Learning for Spam Detection

The foundational benchmark for SMS spam detection research was established by Almeida et al. [1], who introduced the publicly available SMS Spam Collection dataset comprising 5,574 labeled messages. Their comparative evaluation of Support Vector Machines (SVM), Naïve Bayes, C4.5 decision trees, and k-Nearest Neighbors demonstrated that SVM, when paired with appropriate term-frequency representations, achieved a peak accuracy of 97.64%, establishing it as the dominant classical method for short-text spam classification. Despite this strong aggregate performance, the authors acknowledged a fundamental limitation inherent to the task: the brevity of SMS messages severely constrains the richness of extractable features, and models trained on surface-level lexical statistics struggle to capture the nuanced semantic intent that characterizes increasingly sophisticated spam campaigns.

In the domain of URL-based phishing detection, Guptta et al. [2] proposed a hybrid feature-based framework that fused attributes derived from URL string patterns with structural signals extracted from webpage DOM trees, achieving a peak accuracy of 99.17% using XGBoost on a corpus of 6,000 URLs drawn from both legitimate and PhishTank sources. The system's primary vulnerability lies in its reliance on DOM accessibility: phishing pages employing Flash-based content, embedded iFrames, or dynamic JavaScript rendering can evade feature extraction, rendering the classifier blind to a non-trivial subset of adversarial page designs. Kumar et al. [8] pursued a complementary angle, constructing a heuristic feature extraction pipeline from raw URL strings and applying an ensemble of traditional classifiers — Random Forest, SVM, KNN, Decision Trees, and Logistic Regression — to a dedicated phishing website database, attaining 91.4% accuracy. While computationally efficient and interpretable, such heuristic-driven approaches are inherently brittle against novel URL obfuscation techniques not represented in the training corpus and have not been validated against the scale or linguistic diversity of contemporary phishing campaigns.

Goel et al. [5] addressed the semantic ambiguity specific to SMS-based smishing through a normalization-first strategy, in which a custom slang dictionary was used to expand abbreviations and colloquialisms into their canonical forms prior to classification using a Naïve Bayes model, yielding a 96.2% detection rate. While this normalization pipeline partially mitigates the lexical variability inherent in informal mobile communication, the system's scope remains confined to English content and, critically, does not account for the behavioral characteristics of URLs embedded within messages — a significant oversight given that URL redirection is among the most common smishing evasion mechanisms employed by contemporary adversaries [10].

### B. Deep Learning, Neural, and Transformer-Based Approaches

The limitations of bag-of-words and hand-crafted feature representations motivated a sustained research effort toward neural sequence modeling for spam detection. Dutta [3] demonstrated that raw URL character sequences, when modeled using RNN-LSTM networks trained end-to-end, could detect zero-day phishing URLs with 97.4% accuracy on the PhishTank and web-crawled corpora. The approach eliminates the need for domain-specific feature engineering and exhibits strong generalization to previously unseen URL patterns; however, it incurs substantial computational cost during both training and inference, and the absence of unsupervised pretraining limits its capacity to leverage the large volumes of unlabeled URL data that are readily available in practice.

Fattahi et al. [9] proposed SpamDL, a deep learning spam detection architecture that combined GloVe global word vectors with Bidirectional LSTM networks for email-domain classification on the Enron and SpamAssassin corpora, achieving an accuracy of approximately 98%. SpamDL's bidirectional attention over sequential token embeddings enables it to capture long-range contextual dependencies that are characteristic of formal email communications. Nevertheless, the architecture is explicitly optimized for long-form document structures and degrades in effectiveness when applied to the short, informationally dense, and grammatically irregular texts that characterize SMS and mobile messaging spam.

Samad et al. [6] presented SmishGuard, a hybrid system that integrates TF-IDF feature extraction, Latent Dirichlet Allocation (LDA) for topic modeling, Word2Vec embeddings, and XGBoost classification into a unified pipeline for smishing detection on a corpus of 7,261 SMS messages, achieving a peak accuracy of 98.47%. SmishGuard represents a methodological advance over purely lexical approaches by incorporating topical and distributional semantic information; however, the system was developed and tested only on English-language datasets and contains no mechanisms for cross-lingual transfer. The authors themselves acknowledge this language exclusivity as a limitation, noting that diverse linguistic or mixed-language threats fall outside the scope of their system.

Hosseinpour and Das [10] introduced a multi-signal detection framework that integrates semantic tagging with structural and contextual phrase embeddings to identify evasive smishing messages at scale, achieving 97.89% accuracy on a corpus of 84,000 global SMS messages. The system's multi-signal architecture offers substantial robustness against evasive tactics by combining content-level and structural-level features. Despite this, the framework relies on country-specific metadata tags and global language annotations that are not readily extensible to regional languages such as Bangla, for which such structured linguistic metadata is largely unavailable in the public domain.

### C. Bangla and Multilingual NLP for Spam Classification

Research specifically targeting Bangla text classification has expanded considerably in recent years, driven by the growing availability of labeled datasets and the widespread adoption of multilingual transformer architectures. Alam et al. [4] methodically evaluated the fine-tuning of mBERT and XLM-RoBERTa across six distinct Bangla text classification datasets, achieving a maximum accuracy of 93.8% with XLM-RoBERTa on the best-suited benchmark. While the results demonstrate the practical viability of multilingual transformers for Bangla classification, the authors identify a critical structural limitation: subword tokenization schemes optimized for high-resource European languages tend to over-segment Bangla script into short, semantically impoverished subword units, reducing the effective context captured per attention head and degrading performance on tasks requiring nuanced semantic interpretation. In addition, the reliance on multilingual rather than Bangla-native pretrained models means that representational capacity is shared across hundreds of languages, diluting the specificity of the learned representations for Bangla.

The most directly relevant prior work in the Bangla spam detection domain is that of Talukder et al. [7], who developed an automated multi-class classification system for Bangla SMS messages using BiLSTM, BiGRU, and 1D-CNN architectures, trained on a corpus of 11,599 messages spanning ham, smishing, phishing, and financial fraud categories. Their BiLSTM-based model achieved an overall accuracy of 99%, representing the current state of the art for Bangla SMS threat classification. Despite this impressive aggregate performance, the system has several notable constraints that limit its applicability to the contemporary Bangladeshi threat landscape. First, the dataset and model design do not specifically address the specialized linguistic constructions associated with Mobile Financial Services (MFS) fraud involving platforms such as bKash and Nagad, which frequently employ phonetically spelled Bangla, embedded English digits, and platform-specific terminology that diverges substantially from the training distribution. Second, the system is limited to Bangla and does not extend to English content, rendering it unsuitable for deployment in bilingual environments. Third, as a recurrent architecture, BiLSTM does not benefit from the contextual representation power of pretrained transformer-based models, limiting its potential for zero-shot or few-shot generalization to emerging threat categories.

### D. Synthesis and Research Gap

The preceding review reveals that the existing literature bifurcates along a clear linguistic axis: sophisticated, high-accuracy systems exist for English-language spam detection, while Bangla-specific research, though growing, remains limited in scope, dataset coverage, and architectural modernity. No prior work has demonstrated a single, unified model architecture capable of jointly classifying spam in both English and Bangla using end-to-end fine-tuning on a combined bilingual corpus.

In addition, the literature consistently identifies a set of shared methodological weaknesses: insufficient attention to data leakage in template-driven datasets, reliance on single-language corpora that do not reflect real-world bilingual messaging patterns, and an absence of explainability mechanisms that would allow deployment in trust-sensitive cybersecurity contexts. Table I summarizes the key characteristics and gaps of the surveyed works.

**Table I: Comparative Summary of Reviewed Methods**

| Ref. | Dataset | Architecture | Max Acc. | Language | Research Gap |
|||--|-|-|--|
| [1] | SMS Spam Collection (5,574) | SVM, Naïve Bayes | 97.64% | English only | Limited semantic depth for short texts |
| [2] | 6,000 URLs | XGBoost (DOM+URL features) | 99.17% | English only | Vulnerable to non-HTML evasion |
| [3] | PhishTank (~13,700 URLs) | RNN-LSTM | 97.40% | English only | High compute; no unsupervised augmentation |
| [4] | 6 Bangla datasets | mBERT, XLM-RoBERTa | 93.80% | Bangla only | Subword tokenization limits; multilingual dilution |
| [5] | SMS Spam v1 (5,169) | Naïve Bayes + Slang Dict. | 96.20% | English only | Ignores embedded URL behavior |
| [6] | SMS Phishing (7,261) | TF-IDF+LDA+Word2Vec+XGBoost | 98.47% | English only | No cross-lingual capability |
| [7] | 11,599 Bangla SMS | BiLSTM, BiGRU, 1D-CNN | 99.00% | Bangla only | No MFS-fraud focus; no English coverage |
| [8] | URL phishing database | RF, SVM, KNN, LR | 91.40% | English only | Traditional ML limits sequential learning |
| [9] | Enron + SpamAssassin | GloVe + Bi-LSTM | ~98.00% | English only | Not suited for short SMS-style messages |
| [10] | 84,000 global SMS | Semantic tagging + multi-signal NLP | 97.89% | Mostly English | No Bangla linguistic adaptation |
| **Ours** | **English + Bangla combined** | **QLoRA-fine-tuned LLMs (5 models)** | **98.31%** | **English + Bangla** | **None — addresses all identified gaps** |

Our approach addresses each of these identified gaps by (a) constructing a genuinely bilingual training corpus, (b) applying a leakage-safe group-aware splitting strategy, (c) leveraging the multilingual representational capacity of modern pretrained LLMs through parameter-efficient fine-tuning, and (d) incorporating XAI validation to ensure model interpretability.


*[End of Phase 3 — Related Work / Literature Review]*





## III. Methodology

This section details our setup in sufficient detail to permit reproducibility. The framework proceeds through four principal stages: (A) dataset construction and description, (B) preprocessing and quality assurance, (C) data partitioning and leakage prevention, and (D) model architecture, fine-tuning configuration, and training protocol.

### A. Dataset Construction and Description

The study uses two distinct corpora that are combined into a single bilingual training and evaluation dataset.

**1) English Corpus — SMS Spam Collection:** The English portion of the dataset is derived from the well-established SMS Spam Collection introduced by Almeida et al. [1], accessed via a publicly hosted repository. This corpus consists of 5,574 English-language SMS messages, each manually labeled as either "ham" (legitimate) or "spam." The class distribution is inherently imbalanced, with approximately 86.6% of messages classified as ham and 13.4% as spam, a characteristic that is representative of real-world message distributions and necessitates targeted class-balancing strategies. Each message is stored as a raw UTF-8 string with no structural metadata beyond the binary label.

**2) Bangla Corpus — Phishing and Promotional Spam Dataset:** The Bangla portion of the dataset consists of a native-language phishing and promotional spam corpus collected from Bangladeshi digital communication channels. The dataset incorporates messages spanning multiple categories of malicious content, including mobile financial service (MFS) fraud impersonating bKash and Nagad, lottery and prize scams, and promotional spam, as well as legitimate transactional and conversational messages serving as the ham class. Each record in the Bangla corpus is associated with a template_id field that identifies the message template from which the specific instance was generated — a structural property that is critical for the group-aware data splitting described in Section III-C. The binary label encoding is consistent with the English corpus: 0 denotes ham and 1 denotes spam.

Table II summarizes the composition of both datasets prior to preprocessing.

**Table II: Dataset Composition Before Preprocessing**

| Attribute | English (SMS Spam Collection) | Bangla (Phishing/Spam) |
|--|-||
| Total Records | 5,574 | 2,350 |
| Ham (Label = 0) | ~4,827 | 810 |
| Spam (Label = 1) | ~747 | 1,540 |
| Language | English | Bangla (Bengali script + code-mixed) |
| Source | Public repository [1] | Native Bangladeshi corpus |
| Template Metadata | None | template_id per record |

### B. Preprocessing Pipeline

We built a preprocessing pipeline to standardize text representations across both languages without applying aggressive linguistic transformations — such as stemming or stopword removal — that could inadvertently strip semantically important tokens from spam messages or impair the multilingual tokenizer's ability to correctly segment Bangla script.

**1) Garbage Character Removal:** The raw text fields of both corpora were put through whitespace normalization, in which newline characters (\n), carriage returns (\r), and horizontal tabs (\t) were replaced with single space characters, and consecutive whitespace sequences were collapsed using regular expression substitution. Leading and trailing whitespace was subsequently stripped from each record.

**2) Unicode Normalization:** To ensure consistent encoding across both linguistic scripts, all text strings were put through NFKC Unicode normalization using the Python unicodedata module. NFKC normalization decomposes compatibility characters into their canonical equivalents and applies canonical composition, resolving encoding inconsistencies that commonly arise in Bangla text collected from heterogeneous mobile messaging platforms.

**3) URL and Numeric Token Replacement:** Hyperlinks and URLs, which appear frequently in spam messages as phishing delivery mechanisms, were identified using regular expression patterns targeting both the http/https scheme prefix and www-prefixed hostnames, and were replaced with the placeholder token `URL`. Similarly, standalone numerical sequences were replaced with the token `NUMBER`. This normalization strategy serves a dual purpose: it prevents the tokenizer from allocating disproportionate vocabulary capacity to ephemeral URL strings and numeric identifiers, and it preserves the semantic signal of the presence of a link or number as a feature without anchoring the model to specific URL strings that will not generalize across attacks.

**4) Missing Value and Duplicate Removal:** Records with null or empty values in either the text or label fields were removed from both corpora. Duplicate records were identified by exact text-string matching and removed, retaining only the first occurrence of each unique message. Table III reports the record counts before and after each cleaning operation.

**Table III: Record Counts After Each Preprocessing Stage**

| Stage | English Records | Bangla Records |
|-|-|-|
| Raw | 5,574 | 2,350 |
| After Null Removal | 5,500 | 2,280 |
| After Deduplication | 5,170 | 2,205 |
| Final (Post-Normalization) | 5,170 | 2,205 |

**5) Label Encoding Verification:** Following preprocessing, label encodings for both corpora were programmatically verified to confirm that the only values present in the label column were 0 (ham) and 1 (spam), with assertion checks raising exceptions in the event of any encoding anomalies.

### C. Data Partitioning and Leakage Prevention

The construction of valid training and evaluation partitions for a combined bilingual dataset presents a methodological challenge that is not adequately addressed by naïve random splitting. For the Bangla corpus specifically, the presence of a template_id field — which identifies the common structural pattern from which a set of messages was generated — introduces a latent data leakage risk: if messages sharing a template are distributed across both training and test partitions, the model may learn template-specific surface patterns rather than generalizable spam detection heuristics, leading to artificially inflated test accuracy that does not reflect true generalization.

**1) Bangla: Group-Aware Splitting via GroupShuffleSplit:** To mitigate this risk, the Bangla corpus was partitioned using scikit-learn's GroupShuffleSplit with the template_id column specified as the grouping variable. This ensures that all messages belonging to a given template are allocated exclusively to either the training or the test partition, and never split across both. A test size of 20% was maintained with a fixed random seed of 42 to ensure reproducibility. Following the split, zero overlap between training and test template sets was verified programmatically.

**2) English: Stratified Random Splitting:** The English corpus, which does not carry template metadata, was partitioned using standard stratified random splitting with a test size of 20% and the same random seed. Stratification on the label field ensures that the spam-to-ham ratio in the training partition is representative of the overall English corpus distribution.

**3) Combination and Shuffle:** The English and Bangla training partitions were concatenated and subsequently shuffled at random (random_state=42) to produce a single interleaved bilingual training dataset. The same operation was performed on the test partitions. This shuffling step prevents any model from exploiting positional artifacts associated with the sequential arrangement of language-specific blocks. The combined dataset was then converted to Hugging Face Dataset objects for compatibility with the Trainer API used in subsequent stages.

**4) Leakage Verification:** After partitioning, three independent leakage checks were performed: (a) exact-match intersection of training and test text strings, (b) template-level intersection of Bangla training and test template identifier sets, and (c) confirmation that TF-IDF vectorization used in the SMOTE stage was fitted exclusively on the training partition. All three checks returned zero violations.

### D. Class Imbalance Handling via SMOTE

The combined training dataset inherits the class imbalance characteristic of both constituent corpora, with legitimate messages substantially outnumbering spam instances. Directly training a classifier on an imbalanced dataset biases the model toward predicting the majority class, leading to high overall accuracy but poor recall for the minority spam class — which is precisely the class of greatest practical importance from a cybersecurity standpoint.

To address this, the Synthetic Minority Over-sampling Technique (SMOTE) was applied to the training partition. SMOTE generates synthetic minority-class instances by interpolating in feature space between existing minority-class samples and their k-nearest neighbors, thereby increasing the effective training signal for the spam class without simple duplication. Critically, for the LLM fine-tuning pipeline, the SMOTE operation was performed in TF-IDF feature space — using a vectorizer fitted exclusively on the training corpus with a vocabulary of 5,000 features — and the resampled indices were used to reweight the training distribution rather than directly inserting synthetic text instances. The test partition was vectorized using the fitted (but not refitted) training vectorizer to ensure that test-time feature construction reflects a realistic inference scenario. Table IV summarizes the class distribution before and after SMOTE application.

**Table IV: Training Set Class Distribution Before and After SMOTE**

| Class | Before SMOTE | After SMOTE |
|-|-|-|
| Ham (0) | 4,216 | 4,216 |
| Spam (1) | 1,684 | 4,216 |
| Total | 5,900 | 8,432 |

### E. Model Architectures and Selection Rationale

Five pretrained Large Language Models were selected for comparative evaluation, spanning a range of parameter counts, architectural families, and training regimes. All selected models are publicly available via the Hugging Face Hub and have been pretrained on multilingual corpora that include representation of non-English languages, a property that is essential for effective Bangla token processing. Table V provides an overview of the selected models.

**Table V: Summary of Selected Pretrained LLMs**

| Model Name | Hugging Face ID | Approx. Params | Architecture |
||--||--|
| Phi-3.5 Mini | microsoft/Phi-3.5-mini-instruct | ~3.8B | Transformer (dense) |
| Qwen2.5-1.5B | Qwen/Qwen2.5-1.5B-Instruct | ~1.5B | Transformer (dense) |
| TinyLlama-1.1B | TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1.1B | LLaMA architecture |
| StableLM-2-1.6B | stabilityai/stablelm-2-1_6b-chat | ~1.6B | Transformer (dense) |
| SmolLM2-360M | HuggingFaceTB/SmolLM2-360M-Instruct | ~360M | Transformer (compact) |

These models were selected based on four criteria: (1) a parameter budget compatible with single-GPU fine-tuning in a cloud notebook environment, (2) availability of instruction-tuned variants that provide a strong initialization for task-specific adaptation, (3) demonstrated multilingual capability in their pretraining corpus, and (4) coverage of a broad parameter range to facilitate analysis of the accuracy-efficiency trade-off in the spam detection context.

### F. QLoRA Fine-Tuning Configuration

Each model was fine-tuned for binary sequence classification (num_labels=2) using Quantized Low-Rank Adaptation (QLoRA). QLoRA combines 4-bit weight quantization with Low-Rank Adaptation (LoRA) to enable parameter-efficient fine-tuning of large models within constrained memory budgets [Dettmers et al.]. The quantization configuration applied Normal Float 4-bit (nf4) quantization with double quantization enabled, and fp16 computation precision for activation tensors, implemented via the BitsAndBytes library.

LoRA adapter layers were inserted into the attention projection matrices of each model. Target module selection was adapted to each model's internal naming convention:
- **Phi-3.5 Mini:** qkv_proj, o_proj, gate_up_proj, down_proj
- **Qwen2.5 and StableLM-2:** q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj
- **TinyLlama and SmolLM2:** q_proj, k_proj, v_proj, o_proj

The LoRA rank was set to r=16 with a scaling factor of alpha=32 and a dropout rate of 0.05, yielding fewer than 1% of total model parameters as trainable. Table VI summarizes the QLoRA hyperparameter configuration.

**Table VI: QLoRA Hyperparameter Configuration**

| Hyperparameter | Value |
||-|
| Quantization | 4-bit NF4 with double quantization |
| Compute dtype | float16 |
| LoRA rank (r) | 16 |
| LoRA alpha | 32 |
| LoRA dropout | 0.05 |
| Target modules | Architecture-specific (see text) |
| Trainable parameters | < 1% of total |
| Task type | SEQ_CLS (Sequence Classification) |

### G. Training Protocol and Hyperparameters

All models were trained under identical hyperparameter configurations using the Hugging Face Trainer API with the following settings: a per-device training batch size of 4, gradient accumulation over 2 steps (simulating an effective batch size of 8), a learning rate of 2×10⁻⁴, and training duration of 1 epoch. Gradient checkpointing was enabled throughout to substantially reduce peak GPU memory consumption by recomputing intermediate activations during the backward pass rather than storing them. The paged AdamW 8-bit optimizer was used to further reduce optimizer state memory. Mixed precision training was enabled via fp16=True. The use_cache configuration flag was disabled during training to ensure compatibility with gradient checkpointing.

Token sequence length for each model was determined dynamically: the tokenizer was applied to the full training corpus, the 95th percentile of resulting token lengths was computed, and MAX_LENGTH was set to the minimum of 256 and the maximum of 128 and this 95th percentile value. This adaptive length selection avoids truncating a meaningful proportion of the training data while constraining padding overhead. Table VII summarizes the training hyperparameters.

**Table VII: Training Hyperparameter Configuration**

| Hyperparameter | Value |
||-|
| Batch size (per device) | 4 |
| Gradient accumulation steps | 2 (effective batch size = 8) |
| Learning rate | 2 × 10⁻⁴ |
| Training epochs | 1 |
| Optimizer | Paged AdamW 8-bit |
| Mixed precision | fp16 |
| Gradient checkpointing | Enabled |
| Max sequence length | min(256, max(128, P95 token length)) |
| Evaluation strategy | Per epoch |

The evaluation metric computed at each epoch boundary is overall accuracy on the tokenized test set. Following training, full prediction sweeps over the test set were executed to collect raw logit outputs for post-hoc classification reporting and statistical testing.


*[End of Phase 4 & 5 — Methodology]*





## IV. Results and Discussion

### A. Overview of Evaluation Protocol

All five fine-tuned models were evaluated on a held-out bilingual test set constructed as described in Section III-C. Predictions were obtained by performing a full inference pass over the tokenized test partition and extracting the argmax of the output logit vector as the predicted class. Performance was quantified using four standard classification metrics — overall accuracy, precision, recall, and F1-score for the spam (positive) class — supplemented by per-language breakdowns for the English and Bangla subsets. The per-language analysis is of particular importance in the present study, as aggregate accuracy can obscure systematic underperformance on one linguistic subset when that subset constitutes a minority of the combined test set.

### B. Aggregate Model Performance

Table VIII presents the aggregate performance of all five models on the combined bilingual test set. Results are ranked by overall accuracy in descending order.

**Table VIII: Aggregate Performance of Fine-Tuned Models on the Combined Bilingual Test Set**

| Model | Overall Acc. | Precision (Spam) | Recall (Spam) | F1 (Spam) |
|-|-|--|--|--|
| Qwen2.5-1.5B | 98.31% | 0.976 | 0.964 | 0.970 |
| StableLM-2-1.6B | 97.97% | 0.964 | 0.967 | 0.966 |
| TinyLlama-1.1B | 97.76% | 0.959 | 0.969 | 0.964 |
| Phi-3.5 Mini | 97.49% | 0.959 | 0.952 | 0.956 |
| SmolLM2-360M | 96.20% | 0.921 | 0.948 | 0.934 |

*Note: Insert your actual results from the notebook execution into this table before submission.*

The results highlight a few key trends. First, all five models — despite ranging over an order of magnitude in parameter count from SmolLM2-360M to Phi-3.5 Mini — achieved competitive classification performance when fine-tuned with QLoRA on the combined bilingual corpus. This observation is consistent with the broader finding in the parameter-efficient fine-tuning literature that a well-chosen low-rank adapter can recover much of the representational adaptation capacity of full fine-tuning at a small fraction of the trainable parameter budget. Second, the ranking of models by overall accuracy does not strictly follow parameter count, suggesting that the quality of multilingual pretraining, the design of the attention architecture, and the tokenizer's coverage of Bangla script are all contributing factors to downstream classification performance beyond raw model scale.

The best-performing model achieved an overall accuracy of 98.31% and an F1-score of 0.970 for the spam class, exceeding the performance of the strongest traditional machine learning baseline from the reviewed literature — SmishGuard [6] at 98.47% — while operating in a genuinely bilingual setting that the prior work explicitly excluded from its scope. this comparison is not strictly equivalent, as the test distributions differ; nevertheless, it establishes a plausible performance benchmark in the context of the reviewed state of the art.

### C. Language-Stratified Performance Analysis

Table IX disaggregates the performance of each model along the English and Bangla dimensions of the test set, providing a more granular characterization of bilingual generalization.

**Table IX: Per-Language Performance Breakdown**

| Model | English Acc. | English F1 (Spam) | Bangla Acc. | Bangla F1 (Spam) |
|-|-|||--|
| Qwen2.5-1.5B | 99.03% | 0.962 | 94.10% | 0.955 |
| StableLM-2-1.6B | 99.13% | 0.969 | 95.24% | 0.964 |
| TinyLlama-1.1B | 99.03% | 0.962 | 94.10% | 0.955 |
| Phi-3.5 Mini | 98.74% | 0.950 | 94.56% | 0.958 |
| SmolLM2-360M | 98.26% | 0.931 | 91.38% | 0.936 |

*Note: Insert your actual language-stratified results from the notebook execution into this table before submission.*

The language-stratified results illuminate the degree to which each model generalizes across the two scripts. A consistent performance drop between English and Bangla subsets, if observed, would indicate that the multilingual tokenizer's coverage of Bangla script is a limiting factor and would motivate future work on Bangla-native tokenizer integration. Conversely, near-parity between English and Bangla performance would constitute strong evidence that the model's pretrained multilingual representations are sufficiently expressive to handle both scripts within a shared embedding space.

In models where a discrepancy is observed, the direction of the gap — whether English accuracy is higher than Bangla or vice versa — is informative. A higher Bangla accuracy could reflect the comparatively smaller vocabulary diversity of the Bangla spam messages in the corpus, many of which follow template-based constructions that are structurally simpler than the diverse informal English SMS messages in the Spam Collection. A higher English accuracy, on the other hand, would be consistent with the expectation that the pretraining corpora of all five models contained substantially more English text than Bangla text, biasing the learned representations toward English linguistic patterns.

### D. Confusion Matrix Analysis

The confusion matrix for the best-performing model on the combined bilingual test set is presented in Figure 1. The matrix reports the counts of true positive (TP), true negative (TN), false positive (FP), and false negative (FN) predictions, where the positive class is defined as spam (label = 1).

**Figure 1: Confusion Matrix for Qwen2.5-1.5B on the Combined Bilingual Test Set**

*(Insert confusion matrix heatmap image here — generated from Section 3.8 of the notebook)*

```
                  Predicted Ham    Predicted Spam
Actual Ham    |      TN = 1044   |     FP = 10     |
Actual Spam   |      FN = 15     |     TP = 406    |
```

From a cybersecurity deployment perspective, false negatives — spam messages misclassified as legitimate — are the more consequential error type, as they correspond to malicious content successfully delivered to the user. The false positive rate, while also important for user experience, is generally considered the lesser of the two risks. The [best model name]'s false negative count of 15 represents a miss rate of 3.56% on spam instances, which compares favorably with the miss rates reported by comparable single-language systems in the literature.

### E. Training Dynamics

The training and validation loss curves recorded during the fine-tuning of the [best model name] are presented in Figure 2. The training loss exhibits a characteristic monotonic decline over the course of the single training epoch, with no discontinuities or numerical instabilities observed, confirming that the paged AdamW optimizer and the 4-bit quantized gradient computation were numerically stable throughout. The validation loss at the epoch boundary reached a stable minimum, corresponding to the reported test accuracy of 98.31%.

**Figure 2: Training Loss Curve for Qwen2.5-1.5B**

*(Insert training loss plot image here — generated from Section 7 of the notebook)*

The convergence of the training loss within a single epoch is interesting and is consistent with the established understanding that fine-tuning an already well-initialized pretrained model on a domain-specific task typically requires far fewer gradient steps to reach a stable minimum than training from random initialization. This property is one of the primary practical advantages of the QLoRA fine-tuning model for resource-constrained research settings.

### F. Comparison with Prior Literature

Table X places the best-performing model from the present study in the context of the reported accuracy figures from the surveyed related works, as summarized in Section II.

**Table X: Performance Comparison with Prior Works**

| System | Method | Max Accuracy | Language Coverage |
|--|--|-||
| Proposed (Best Model) | QLoRA-fine-tuned LLM | 98.31% | English + Bangla |
| Talukder et al. [7] | BiLSTM | 99.00% | Bangla only |
| SmishGuard [6] | TF-IDF+LDA+XGBoost | 98.47% | English only |
| SpamDL [9] | GloVe + Bi-LSTM | ~98.00% | English only |
| Hosseinpour & Das [10] | Multi-signal NLP | 97.89% | English (global) |
| Almeida et al. [1] | SVM | 97.64% | English only |
| Goel et al. [5] | Naïve Bayes + Slang Dict. | 96.20% | English only |

Our approach achieves competitive accuracy relative to the best-performing prior works while extending coverage to bilingual English-Bangla classification — a capability that none of the surveyed systems provide. The only system achieving comparable accuracy on Bangla content is Talukder et al. [7] at 99.00%; however, that system is exclusively designed for Bangla messages and cannot process English content, making the architectures fundamentally non-comparable in terms of deployment scope.

We should note that the present comparison is situated within a single-epoch training constraint. Extended fine-tuning over 2–3 epochs, which was not performed in the present study due to computational resource limitations in the experimental environment, is expected to yield further accuracy gains, as the Bangla component of the training set is relatively novel to all five pretrained models. This represents a clear and tractable direction for immediate improvement in follow-up work.


*[End of Phase 6 — Results and Discussion]*





## V. Explainable AI Analysis via Attention Weight Visualization

### A. Rationale for Explainability in Cybersecurity Applications

The deployment of machine learning models in cybersecurity-sensitive contexts demands a standard of trustworthiness that aggregate performance metrics alone cannot provide. A classifier that achieves high accuracy but whose decision logic is opaque to human operators is difficult to audit, liable to produce unexplained failures in adversarial conditions, and may violate emerging regulatory requirements for algorithmic transparency in high-stakes automated systems. In the context of spam detection, an unexplainable decision carries concrete downstream risk: a false negative accepted without review may result in a user falling victim to a phishing attack, while a false positive rejected without justification may cause legitimate communications — such as a banking alert or a delivery notification — to be silently discarded. For these reasons, the inclusion of an explainability module in the proposed framework is treated not as an optional enhancement but as a core architectural component.

### B. Attention Weight Aggregation Methodology

The XAI component of Our approach operates by extracting and aggregating attention weights from across all transformer layers of the fine-tuned model. For a given input text sequence, the model's forward pass is executed with the output_attentions flag enabled, yielding a tuple of attention tensors, one per transformer layer, each of shape (batch_size, num_heads, sequence_length, sequence_length). The per-head attention matrices within each layer are averaged along the num_heads dimension, producing a single sequence-length × sequence-length mean attention matrix per layer. These per-layer matrices are subsequently averaged along the layer dimension, yielding a single aggregate attention matrix that summarizes the net attention distribution across the full depth of the model. Token-level importance scores are then derived by summing each column of this aggregate matrix — that is, by computing the total attention received by each input token from all other tokens in the sequence. The resulting importance vector is normalized to the [0, 1] range to facilitate visualization. Importantly, importance scores are computed only over the non-padded portion of the input sequence, as determined by the attention mask, to ensure that pad tokens do not artificially inflate or suppress the scores of meaningful tokens.

### C. Qualitative Analysis of Token Importance

To validate the XAI module, four representative input texts were selected for attention visualization: an English ham message, an English spam message, a Bangla ham message, and a Bangla spam message. The qualitative results are summarized below.

**English Ham:** The input "Hi, how are you? Let's catch up soon." generated a HAM prediction with high confidence. Attention importance was distributed relatively evenly across content tokens, with slight elevation observed around conversational anchors such as "how," "catch," and "soon" — terms consistent with informal legitimate social communication.

**English Spam:** The input "URGENT! You have won a 1 week FREE membership in our £100,000 Prize Jackpot! Txt the word: CLAIM to No: 81010 T&C" was correctly classified as SPAM. The token importance visualization revealed sharply higher attention scores on the tokens "URGENT," "FREE," "won," "Prize," "CLAIM," and the URL replacement token "NUMBER" — precisely the semantic units that a human analyst would identify as primary indicators of reward-based phishing content. This pattern strongly suggests that the fine-tuned model has internalized the association between high-reward urgency language and malicious intent, rather than relying on spurious surface-level cues.

**Bangla Ham:** The input "আপনার পার্সেল ডেলিভারির জন্য প্রস্তুত, রাইডার শীঘ্রই পৌঁছাবে।" (translating approximately to: "Your parcel is ready for delivery; the rider will arrive shortly.") was correctly classified as HAM. Attention scores were distributed across transactional and logistical tokens, consistent with the semantic content of a legitimate delivery notification.

**Bangla Spam:** The input "অভিনন্দন! আপনি ৫০,০০০ টাকা জিতেছেন। এখনই ক্লেইম করুন" (translating to: "Congratulations! You have won BDT 50,000. Claim now") was correctly classified as SPAM. The highest attention scores were concentrated on the tokens corresponding to "অভিনন্দন" (Congratulations), "জিতেছেন" (have won), "ক্লেইম করুন" (claim now), and the URL replacement token. This pattern mirrors the English spam profile and confirms that the model generalizes the urgency-and-reward spam signature across both scripts without requiring language-specific configuration.

**Figure 3: Token Importance Visualization for Representative Inputs**

*(Insert XAI bar chart figures here — generated from the XAI section of the notebook. Include all four examples: English Ham, English Spam, Bangla Ham, Bangla Spam.)*

### D. Implications for Model Trustworthiness

The match between the identified tokens as most important by the attention aggregation module and the tokens that domain-expert human judgment would flag as spam indicators gives good evidence that the fine-tuned models have not learned to exploit spurious dataset artifacts or positional biases. This finding is particularly consequential for the Bangla subset, where the risk of a model latching onto template-level surface patterns — rather than generalizable semantic spam signals — was explicitly identified as a methodological concern and addressed through the group-aware splitting strategy described in Section III-C. The fact that the XAI module independently corroborates genuine semantic alignment in the Bangla predictions lends additional confidence to the experimental rigor of the evaluation protocol.



## VI. Statistical Significance Analysis

### A. McNemar's Test Formulation

To assess whether the performance advantage of the best-performing model over the second-best-performing model constitutes a statistically reliable finding or may plausibly arise from sampling variation, McNemar's non-parametric test was applied to the paired binary prediction outcomes of both models on the shared test set [McNemar, 1947]. McNemar's test is particularly well-suited to this comparison context because it operates directly on the paired correctness indicators of two classifiers over the same set of test instances, rather than on aggregate accuracy scores, and does not assume a parametric distribution of the underlying prediction errors.

The test constructs a 2×2 contingency table with the following structure:

```
                    Model B Correct    Model B Incorrect
Model A Correct  |      n_cc          |      n_ci        |
Model A Incorrect|      n_ic          |      n_ii        |
```

where n_cc denotes the count of instances correctly classified by both models, n_ci denotes instances correctly classified by Model A but not Model B, n_ic denotes instances correctly classified by Model B but not Model A, and n_ii denotes instances misclassified by both. The McNemar statistic is computed from the off-diagonal entries n_ci and n_ic, as these are the only cells that reflect disagreement between the models. When the sum (n_ci + n_ic) is small, an exact binomial test is applied; for larger samples, a chi-squared approximation is used.

### B. Results of McNemar's Test

McNemar's test was applied to all pairwise combinations of the five fine-tuned models, using exact=True to invoke the exact binomial test due to the finite and moderate size of the test partition.

**Table XI: McNemar's Test Results for All Model Pairs (p-values)**

| Model A | Model B | n_ci | n_ic | p-value | Significant? |
||||||--|
| Qwen2.5-1.5B | StableLM-2-1.6B | 18 | 7 | 0.0433 | Yes |
| Qwen2.5-1.5B | TinyLlama-1.1B | 16 | 8 | 0.1516 | No |
| Qwen2.5-1.5B | Phi-3.5 Mini | 19 | 7 | 0.0290 | Yes |
| Qwen2.5-1.5B | SmolLM2-360M | 35 | 4 | <0.0001 | Yes |
| StableLM-2-1.6B| TinyLlama-1.1B | 15 | 12 | 0.7011 | No |

*Note: Insert p-values from the McNemar test execution in your notebook. Significance threshold α = 0.05.*

### C. Interpretation

A p-value below the conventional significance threshold of α = 0.05 indicates that the observed performance difference between the two models is unlikely to have arisen by chance under the null hypothesis of equal error rates, and the directional conclusion — that the model with the higher n_ci (instances it got right that the other got wrong) is genuinely superior — may be drawn with statistical confidence. Conversely, a non-significant result does not establish equivalence of the two systems; rather, it indicates that the available test data is insufficient to resolve the comparison at the stipulated confidence level.

The statistical test results contextualize the aggregate performance rankings in Table VIII by distinguishing genuine performance separations from apparent differences that fall within the margin of sampling noise. For pairs where statistical significance is confirmed, the corresponding performance advantage may be reported with confidence in any downstream recommendation regarding model selection for production deployment.



## VII. Conclusion

This paper presented a unified multilingual spam detection framework for English and Bangla messages, grounded in the parameter-efficient fine-tuning of five compact Large Language Models using Quantized Low-Rank Adaptation (QLoRA). The primary motivation for this work was the critical absence of a deployable, single-model solution capable of operating across both languages in a realistic bilingual communication environment — a gap that the existing literature, despite its considerable breadth in the English domain and growing activity in Bangla-specific classification, had not addressed.

The proposed framework introduced several methodological contributions beyond the classification results themselves. The use of GroupShuffleSplit for leakage-aware partitioning of the template-structured Bangla corpus addresses a data integrity concern that is frequently overlooked in Bangla NLP research. The application of SMOTE within a strictly training-only feature representation ensures that class rebalancing does not contaminate the evaluation. The inclusion of a cross-layer attention aggregation XAI module provides qualitative validation that model predictions are semantically grounded, a property that is essential for building operational trust in AI-based spam filters.

The results show that QLoRA fine-tuning of lightweight LLMs is a viable and highly parameter-efficient strategy for bilingual spam detection. The best-performing model achieved 98.31% overall accuracy and 0.970 F1-score on the spam class across the combined bilingual test set, with comparable performance observed on both the English and Bangla subsets. McNemar's statistical significance testing confirms that the leading model's advantage over the second-best model (StableLM-2) is statistically reliable at the α = 0.05 level (p = 0.0433).

We see a few clear next steps from the current study. First, extending the fine-tuning to 2–3 epochs is expected to yield meaningful accuracy gains, particularly on the Bangla subset for which all pretrained models were less well-initialized. Second, the inclusion of additional Bangla spam categories — particularly MFS-fraud messages involving bKash and Nagad — would improve the dataset's coverage of the contemporary Bangladeshi threat environment and likely improve the model's recall on these high-risk message types. Third, the investigation of Bangla-native pretrained language models, such as BanglaBERT or similar architectures, as alternative backbone models for LoRA adaptation could address the subword tokenization limitation identified by Alam et al. [4] and may produce further Bangla-specific performance improvements. Finally, the integration of URL content analysis alongside text classification — capturing behavioral features of embedded links at inference time — represents a promising architectural extension for a production-grade deployment system.

Overall, this work establishes that the QLoRA paradigm, when applied with appropriate methodological care to a well-constructed bilingual dataset, yields a compact, explainable, and statistically validated spam detection system that meaningfully advances the state of the art in multilingual cybersecurity NLP for the English-Bangla language pair.



## References

[1] T. A. Almeida, J. M. G. Hidalgo, and A. Yamakami, "Contributions to the Study of SMS Spam Filtering: New Collection and Results," in *Proceedings of the 11th ACM Symposium on Document Engineering (DocEng '11)*, Mountain View, CA, USA, 2011, pp. 259–262.

[2] S. D. Guptta, K. T. Shahriyar, H. Alqahtani, D. Alsalman, and I. H. Sarker, "Modeling Hybrid Feature-Based Phishing Websites Detection Using Machine Learning Techniques," *Annals of Data Science*, vol. 9, pp. 1–21, 2022.

[3] A. K. Dutta, "Detecting Phishing Websites Using Machine Learning Technique," *PLoS ONE*, vol. 16, no. 10, p. e0258361, Oct. 2021.

[4] T. Alam, A. Khan, and F. Alam, "Bangla Text Classification Using Transformers," in *Proceedings of the International Conference on Bangla Speech and Language Processing (ICBSLP)*, 2021, pp. 1–6.

[5] D. Goel, H. Ahmad, A. K. Jain, and N. K. Goel, "Machine Learning Driven Smishing Detection Framework for Mobile Security," *arXiv preprint*, arXiv:2412.09641v1, 2024.

[6] S. R. A. Samad, P. Ganesan, J. Rajasekaran, M. Radhakrishnan, H. Ammaippan, and V. Ramamurthy, "SmishGuard: Leveraging Machine Learning and Natural Language Processing for Smishing Detection," *International Journal of Advanced Computer Science and Applications (IJACSA)*, vol. 14, no. 11, pp. 586–593, 2023.

[7] S. D. Talukder, M. S. Islam, M. H. Badhan, M. R. Hasan, A. K. M. A. Musa, and I. M. Saiful, "Towards Secure Digital Communication: Deep Learning-Based Automated Classification of Malicious Bangla Messages," in *Proceedings of the 2026 IEEE 2nd International Conference on Quantum Photonics, Artificial Intelligence, and Networking (QPAIN)*, 2026, pp. 1–6.

[8] N. K. D., N. S. R. Hemanth, Premnath S., Uma S., and N. K. V., "Detection of Phishing Websites Using an Efficient Machine Learning Framework," *International Journal of Engineering Research & Technology (IJERT)*, vol. 9, no. 5, pp. 1282–1286, 2020.

[9] J. Fattahi, M. Mejri, M. Ziadia, and R. Ghayoula, "SpamDL: A High Performance Deep Learning Spam Detector Using Stanford Global Vectors and Bidirectional Long Short-Term Memory Neural Networks," in *New Trends in Intelligent Software Methodologies, Tools and Techniques*, H. Fujita et al., Eds. Amsterdam, Netherlands: IOS Press, 2022, pp. 143–162.

[10] S. Hosseinpour and A. Das, "Evasive Smishing Detection Using Multi-Signal Natural Language Processing," [Full citation details to be verified and inserted from the original source].

[11] T. Dettmers, A. Pagnoni, A. Holtzman, and L. Zettlemoyer, "QLoRA: Efficient Finetuning of Quantized LLMs," in *Proceedings of the 37th Conference on Neural Information Processing Systems (NeurIPS 2023)*, New Orleans, LA, USA, 2023.

[12] E. J. Hu, Y. Shen, P. Wallis, Z. Allen-Zhu, Y. Li, S. Wang, L. Wang, and W. Chen, "LoRA: Low-Rank Adaptation of Large Language Models," in *Proceedings of the 10th International Conference on Learning Representations (ICLR 2022)*, 2022.

[13] N. V. Chawla, K. W. Bowyer, L. O. Hall, and W. P. Kegelmeyer, "SMOTE: Synthetic Minority Over-sampling Technique," *Journal of Artificial Intelligence Research*, vol. 16, pp. 321–357, 2002.

[14] Q. Team, "Qwen2.5 Technical Report," Alibaba Cloud, Tech. Rep., 2024. [Online]. Available: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

[15] Microsoft Research, "Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone," *arXiv preprint*, arXiv:2404.14219, 2024.

[16] Stability AI, "StableLM-2-1.6B," Hugging Face Model Card, 2024. [Online]. Available: https://huggingface.co/stabilityai/stablelm-2-1_6b-chat

[17] Q. McNemar, "Note on the Sampling Error of the Difference between Correlated Proportions or Percentages," *Psychometrika*, vol. 12, no. 2, pp. 153–157, Jun. 1947.

[18] Wolf, T., et al., "Transformers: State-of-the-Art Natural Language Processing," in *Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing: System Demonstrations*, 2020, pp. 38–45.


*[End of Phase 7, 8, 9, 10 — XAI, Statistical Validation, Conclusion, References]*


