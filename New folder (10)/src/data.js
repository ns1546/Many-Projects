export const clauseLibrary = [
  { 
    id: 'c_saas_access', 
    title: 'Provision of Services & SLA', 
    type: 'services', 
    depth: 0, 
    content: 'Subject to this Agreement, Provider grants Customer a non-exclusive, non-transferable right to access and use the Services during the Subscription Term. Provider will use commercially reasonable efforts to make the Services available {{uptimeSLA}}% of the time, excluding planned downtime. Support will be provided in accordance with the {{supportTier}} support policy.',
    variables: [
      { key: 'uptimeSLA', label: 'Uptime SLA (%)', type: 'number', default: '99.9' },
      { key: 'supportTier', label: 'Support Tier', type: 'select', options: ['Standard', 'Premium', 'Enterprise 24/7'], default: 'Standard' }
    ]
  },
  { 
    id: 'c_saas_restrictions', 
    title: 'Use Restrictions', 
    type: 'restrictions', 
    depth: 0, 
    content: 'Customer will not, and will not permit any third party to: (a) reverse engineer, decompile, or attempt to discover the source code of the Services; (b) modify or create derivative works; or (c) use the Services to build a competitive product.' 
  },
  { 
    id: 'c_saas_fees', 
    title: 'Fees, Invoicing and Taxes', 
    type: 'fees', 
    depth: 0, 
    content: 'Customer will pay all fees specified in the Order Form. Fees will be invoiced in advance on a {{billingCycle}} basis. Charges are due net {{netPaymentDays}} days from the invoice date. Late payments accrue interest at {{lateFeeRate}}% per month.',
    variables: [
      { key: 'billingCycle', label: 'Billing Cycle', type: 'select', options: ['Monthly', 'Quarterly', 'Annually'], default: 'Annually' },
      { key: 'netPaymentDays', label: 'Payment Terms (Net Days)', type: 'number', default: '30' },
      { key: 'lateFeeRate', label: 'Late Fee Interest Rate (%)', type: 'number', default: '1.5' }
    ]
  },
  { 
    id: 'c_saas_ip', 
    title: 'Proprietary Rights', 
    type: 'ip', 
    depth: 0, 
    content: 'Provider retains all intellectual property rights in the Services and aggregated usage data. Customer retains all rights to data submitted to the Services ("Customer Data"). Customer grants Provider a worldwide license to host and process Customer Data solely to provide the Services.' 
  },
  { 
    id: 'c_saas_data', 
    title: 'Data Privacy and Security', 
    type: 'privacy', 
    depth: 0, 
    content: 'Provider will maintain industry-standard administrative, physical, and technical safeguards for Customer Data. The processing of personal data is governed by the Data Processing Agreement (DPA) executed between the parties, which complies with {{dataRegulation}}.',
    variables: [
      { key: 'dataRegulation', label: 'Data Regulation Standard', type: 'select', options: ['GDPR and CCPA', 'HIPAA', 'SOC 2 Type II'], default: 'GDPR and CCPA' }
    ]
  },
  { 
    id: 'c_saas_indemnity', 
    title: 'Mutual Indemnification', 
    type: 'indemnity', 
    depth: 0, 
    content: 'Provider will defend Customer against any third-party claim alleging the Services infringe a patent or copyright, and indemnify against final damages. Customer will defend Provider against any claim arising from Customer Data infringing third-party rights.' 
  },
  { 
    id: 'c_saas_liability', 
    title: 'Limitation of Liability', 
    type: 'liability', 
    depth: 0, 
    content: 'IN NO EVENT WILL EITHER PARTY HAVE LIABILITY FOR LOST PROFITS OR INDIRECT DAMAGES. AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CUSTOMER IN THE {{liabilityTrailingMonths}} MONTHS PRECEDING THE INCIDENT.',
    variables: [
      { key: 'liabilityTrailingMonths', label: 'Liability Cap (Trailing Months)', type: 'number', default: '12' }
    ],
    fallbacks: [
      { id: 'fb_liability_1', title: 'Fallback 1: High Cap (24 Months)', content: 'IN NO EVENT WILL EITHER PARTY HAVE LIABILITY FOR LOST PROFITS. AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CUSTOMER IN THE TWENTY-FOUR (24) MONTHS PRECEDING THE INCIDENT.' },
      { id: 'fb_liability_2', title: 'Fallback 2: Unlimited Liability (HIGH RISK)', content: 'NEITHER PARTY\'S LIABILITY ARISING OUT OF THIS AGREEMENT SHALL BE CAPPED. BOTH PARTIES ACCEPT UNLIMITED LIABILITY FOR DIRECT DAMAGES.' }
    ]
  },
  { 
    id: 'c_saas_term', 
    title: 'Term and Termination', 
    type: 'termination', 
    depth: 0, 
    content: 'This Agreement commences on the Effective Date. Either party may terminate for cause upon {{breachCureDays}} days written notice of a material breach if uncured. Upon termination, Customer may retrieve its data for a period of {{dataRetentionDays}} days.',
    variables: [
      { key: 'breachCureDays', label: 'Breach Cure Period (Days)', type: 'number', default: '30' },
      { key: 'dataRetentionDays', label: 'Post-Termination Data Retention (Days)', type: 'number', default: '30' }
    ]
  },
  { 
    id: 'c_saas_gov', 
    title: 'Governing Law', 
    type: 'governing_law', 
    depth: 0, 
    content: 'This Agreement shall be governed by the laws of the State of {{governingState}}, without regard to conflict of laws principles.',
    variables: [
      { key: 'governingState', label: 'Governing State (US)', type: 'text', default: 'Delaware' }
    ],
    fallbacks: [
      { id: 'fb_gov_1', title: 'Fallback 1: Arbitration Clause', content: 'Any dispute arising out of this Agreement shall be resolved by binding arbitration in {{governingState}} in accordance with the rules of the American Arbitration Association.' }
    ]
  },
  // GOVERNMENT CLAUSES (HIGHLY DECORATED)
  {
    id: 'c_gov_scope',
    title: 'Scope of Work and Deliverables',
    type: 'services',
    depth: 0,
    content: 'The Contractor shall provide the systems, software, and support services necessary to fulfill the operational requirements of the Government Agency. The specific deliverables are enumerated in the Deliverables Schedule below.'
  },
  {
    id: 'c_gov_deliverables_table',
    title: 'Deliverables Schedule',
    type: 'table_deliverables',
    depth: 1,
    content: 'All deliverables must meet the acceptance criteria defined by the Contracting Officer Technical Representative (COTR).',
    variables: [
      { key: 'deliveryTimelineDays', label: 'Initial Delivery Timeline (Days)', type: 'number', default: '45' }
    ]
  },
  {
    id: 'c_gov_sla_master',
    title: 'Performance Standards and SLA',
    type: 'services',
    depth: 0,
    content: 'The Contractor is bound by strict performance metrics. Deductions and Service Credits will be automatically applied to monthly invoices if these metrics are not sustained.'
  },
  {
    id: 'c_gov_sla_table',
    title: 'Service Level Agreement Matrix',
    type: 'table_sla',
    depth: 1,
    content: 'Provider agrees to maintain the following Service Levels. Failure to meet these metrics will result in the issuance of Service Credits as outlined in the matrix below.',
    variables: [
      { key: 'uptimeSLA', label: 'System Uptime Target (%)', type: 'text', default: '99.99' },
      { key: 'incidentResponseMins', label: 'Critical Incident Response (Mins)', type: 'number', default: '15' }
    ]
  },
  {
    id: 'c_gov_compliance_master',
    title: 'Regulatory and Security Compliance',
    type: 'compliance',
    depth: 0,
    content: 'The Contractor shall ensure all systems processing Government data comply with the baseline security requirements established by the Department of Defense and civilian agencies.'
  },
  {
    id: 'c_gov_compliance_fedramp',
    title: 'FedRAMP Authorization',
    type: 'compliance',
    depth: 1,
    content: 'Contractor maintains a FedRAMP {{fedrampLevel}} Agency Authorization. Contractor must provide the Government with continuous monitoring (ConMon) reports on a monthly basis.',
    variables: [
      { key: 'fedrampLevel', label: 'FedRAMP Authorization Level', type: 'select', options: ['Moderate', 'High', 'DoD IL4', 'DoD IL5', 'DoD IL6'], default: 'High' }
    ]
  },
  {
    id: 'c_gov_compliance_nist',
    title: 'NIST 800-171 Safeguards',
    type: 'compliance',
    depth: 1,
    content: 'Pursuant to DFARS 252.204-7012, the Contractor shall implement the security requirements specified by National Institute of Standards and Technology (NIST) Special Publication (SP) 800-171 for all Covered Defense Information (CDI).'
  },
  {
    id: 'c_gov_pricing_master',
    title: 'Compensation and Pricing',
    type: 'fees',
    depth: 0,
    content: 'The Government shall pay the Contractor in arrears, pursuant to the Prompt Payment Act. All prices are Firm-Fixed-Price (FFP) and encompass all costs of performance.'
  },
  {
    id: 'c_gov_pricing_table',
    title: 'Pricing and Remuneration Matrix',
    type: 'table_pricing',
    depth: 1,
    content: 'Customer agrees to compensate Provider in accordance with the following pricing schedule. All amounts are locked for the duration of the Initial Term.',
    variables: [
      { key: 'baseLicenseFee', label: 'GovCloud Base License Fee ($)', type: 'text', default: '150,000' },
      { key: 'supportFee', label: 'Security Cleared Support Fee ($)', type: 'text', default: '50,000' }
    ]
  },
  {
    id: 'c_gov_insurance_table',
    title: 'Required Insurance Coverages',
    type: 'table_insurance',
    depth: 0,
    content: 'The Contractor shall, at its own expense, provide and maintain during the entire performance of this contract, at least the kinds and minimum amounts of insurance required in the Schedule.'
  }
];

export const templateLibrary = [
  {
    id: 't_gov_contract',
    name: 'U.S. Federal Government Procurement Agreement',
    description: 'Fully professional, highly decorated government procurement contract including strict SLA tables, nested compliance sub-clauses (NIST/FedRAMP), and pricing matrices.',
    sections: [
      { id: 'sec_cover', title: 'Contract Award', type: 'parties', depth: 0, locked: true, content: 'This Federal Procurement Agreement (this "Contract") is awarded on {{date}} by and between {{partyA}} (the "Contractor"), possessing CAGE Code {{cageCode}}, and {{partyB}} (the "Government").\n\nThis is a Firm-Fixed-Price (FFP) contract for commercial items prepared in accordance with the format in FAR Subpart 12.6.', variables: [{ key: 'cageCode', label: 'Contractor CAGE Code', type: 'text', default: '8A3B9' }] },
      
      ...clauseLibrary.filter(c => ['c_gov_scope', 'c_gov_deliverables_table', 'c_gov_sla_master', 'c_gov_sla_table'].includes(c.id)).map(c => ({...c, id: `${c.id}_template`})),
      
      ...clauseLibrary.filter(c => ['c_gov_compliance_master', 'c_gov_compliance_fedramp', 'c_gov_compliance_nist'].includes(c.id)).map(c => ({...c, id: `${c.id}_template`})),
      
      ...clauseLibrary.filter(c => ['c_gov_pricing_master', 'c_gov_pricing_table', 'c_gov_insurance_table'].includes(c.id)).map(c => ({...c, id: `${c.id}_template`})),
      
      
      { id: 'sec_sig', title: 'Authorizing Signatures', type: 'signatures', depth: 0, locked: true, content: 'IN WITNESS WHEREOF, the Contracting Officer and the Contractor have executed this Contract.\n\n[DocuSign_Anchor_Gov_1]                        [DocuSign_Anchor_Contractor_1]' }
    ]
  },
  {
    id: 't_saas_msa',
    name: 'B2B SaaS Master Subscription Agreement',
    description: 'The definitive Y-Combinator/ABA standard SaaS MSA. Contains Legal Playbook fallbacks for Liability and Governing Law.',
    sections: [
      { id: 'sec_cover', title: 'Parties', type: 'parties', depth: 0, locked: true, content: 'This Master Subscription Agreement (this "Agreement") is entered into on {{date}} by and between {{partyA}} ("Provider") and {{partyB}} ("Customer").' },
      ...clauseLibrary.filter(c => c.id.startsWith('c_saas_')).map(c => ({...c, id: `${c.id}_template`})),
      { id: 'sec_sig', title: 'Signatures', type: 'signatures', depth: 0, locked: true, content: 'IN WITNESS WHEREOF, the parties have executed this Agreement.\n\n[DocuSign_Anchor_Provider_1]                   [DocuSign_Anchor_Customer_1]' }
    ]
  }
];
