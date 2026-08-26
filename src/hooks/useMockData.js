// Rich Mock PDF Document Data with stylized template types for visual rendering

export function getMockDocuments() {
  const pageTypes = ['cover', 'text_columns', 'financial_table', 'chart_analytics', 'legal_contract', 'invoice', 'text_article', 'diagram'];

  const generatePages = (count, docColor) => {
    return Array.from({ length: count }, (_, i) => {
      const typeIndex = i % pageTypes.length;
      return {
        id: crypto.randomUUID(),
        pageNumber: i + 1,
        width: 612,
        height: 792,
        selected: false,
        rotation: 0, // 0, 90, 180, 270
        templateType: i === 0 ? 'cover' : pageTypes[typeIndex],
        title: `Page ${i + 1}`,
        subtitle: i === 0 ? 'Executive Summary & Overview' : `Section ${Math.floor(i / 2) + 1}.${(i % 2) + 1}`,
      };
    });
  };

  return [
    {
      id: 'doc-annual-report',
      name: 'Annual_Report_2025.pdf',
      filePath: '/mock/Annual_Report_2025.pdf',
      pageCount: 12,
      fileSize: '4.8 MB',
      updatedAt: 'Just now',
      color: 'violet',
      pages: generatePages(12, 'violet'),
      metadata: { 
        title: 'Annual Fiscal Performance & Strategy 2025', 
        author: 'Bind Financial Corp',
        subject: 'Corporate Annual Report'
      }
    },
    {
      id: 'doc-contract-draft',
      name: 'MSA_Enterprise_Agreement.pdf',
      filePath: '/mock/MSA_Enterprise_Agreement.pdf',
      pageCount: 4,
      fileSize: '1.2 MB',
      updatedAt: '2h ago',
      color: 'blue',
      pages: generatePages(4, 'blue'),
      metadata: { 
        title: 'Master Services Agreement', 
        author: 'Legal Counsel',
        subject: 'Enterprise Terms'
      }
    },
    {
      id: 'doc-design-specs',
      name: 'Design_System_Spec_v2.4.pdf',
      filePath: '/mock/Design_System_Spec_v2.4.pdf',
      pageCount: 8,
      fileSize: '8.1 MB',
      updatedAt: 'Yesterday',
      color: 'emerald',
      pages: generatePages(8, 'emerald'),
      metadata: { 
        title: 'Design System & Token Architecture', 
        author: 'Product Experience Team',
        subject: 'Design Guidelines'
      }
    }
  ];
}

export default getMockDocuments;
