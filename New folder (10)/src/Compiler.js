// AST Compiler Engine
// Transforms the raw Document AST into a rendered layout structure with resolved variables, hierarchical numbering, and cross-references.

export class DocumentCompiler {
  constructor(metadata, sections, theme) {
    this.metadata = metadata;
    this.sections = sections;
    this.theme = theme || {};
  }

  // Resolves variables like {{partyA}} against metadata
  resolveVariables(text) {
    if (!text) return '';
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return this.metadata[trimmedKey] || `[${trimmedKey.toUpperCase()}]`;
    });
  }

  // Hierarchical Numbering Engine
  // Converts flat sections into numbered blocks (1., 1.1, 2.) based on depth
  computeNumbering(sections) {
    const counters = [0, 0, 0, 0];
    let currentDepth = 0;

    return sections.map(section => {
      if (section.type === 'signatures' || section.type === 'cover') {
        return { ...section, displayIndex: '' }; // No numbering for signatures
      }

      const depth = section.depth || 0;
      
      if (depth > currentDepth) {
        counters[depth] = 1;
      } else if (depth < currentDepth) {
        for (let i = depth + 1; i < counters.length; i++) counters[i] = 0;
        counters[depth]++;
      } else {
        counters[depth]++;
      }
      currentDepth = depth;

      const displayIndex = counters.slice(0, depth + 1).join('.') + '.';
      return { ...section, displayIndex };
    });
  }

  // Cross-reference Engine
  // Resolves [[ref:clause_id]] to the actual display index
  resolveReferences(sectionsWithNumbers) {
    const idToIndexMap = {};
    sectionsWithNumbers.forEach(sec => {
      idToIndexMap[sec.id] = sec.displayIndex;
    });

    return sectionsWithNumbers.map(sec => {
      let resolvedContent = this.resolveVariables(sec.content);
      
      // Resolve [[ref:sec_id]]
      resolvedContent = resolvedContent.replace(/\[\[ref:([^\]]+)\]\]/g, (match, refId) => {
        return idToIndexMap[refId] ? `Section ${idToIndexMap[refId].replace(/\.$/, '')}` : '[Broken Reference]';
      });

      return {
        ...sec,
        resolvedContent
      };
    });
  }

  compile() {
    let processed = this.computeNumbering(this.sections);
    processed = this.resolveReferences(processed);
    
    return {
      metadata: this.metadata,
      sections: processed,
      isComplete: this.validate().isValid
    };
  }

  validate() {
    const errors = [];
    if (!this.metadata.partyA) errors.push('Missing Party A');
    if (!this.metadata.partyB) errors.push('Missing Party B');
    if (!this.metadata.agreementType) errors.push('Missing Agreement Type');

    // Check for broken references
    const idSet = new Set(this.sections.map(s => s.id));
    this.sections.forEach(sec => {
      const refs = [...sec.content.matchAll(/\[\[ref:([^\]]+)\]\]/g)];
      refs.forEach(refMatch => {
        if (!idSet.has(refMatch[1])) {
          errors.push(`Broken reference to ${refMatch[1]} in section ${sec.title}`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
