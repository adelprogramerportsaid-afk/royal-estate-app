import { Property, UserRole, ContractTemplate } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'فيلا مستقلة في التجمع الخامس',
    price: 15000000,
    area: 450,
    location: 'القاهرة الجديدة، حي النرجس',
    type: 'villa',
    status: 'sale',
    image: 'https://picsum.photos/800/600?random=1',
    bedrooms: 5,
    bathrooms: 4,
    finishing: 'الترا سوبر لوكس',
    description: 'فيلا رائعة بحديقة خاصة وحمام سباحة، تشطيب استيراد بالكامل.'
  },
  {
    id: '2',
    title: 'شقة بفيو مميز بالعاصمة الإدارية',
    price: 3500000,
    area: 165,
    location: 'العاصمة الإدارية، الحي السابع R7',
    type: 'apartment',
    status: 'sale',
    image: 'https://picsum.photos/800/600?random=2',
    bedrooms: 3,
    bathrooms: 2,
    finishing: 'نصف تشطيب',
    description: 'شقة ناصية بحري صريح، قريبة من الخدمات والجامعة.'
  },
  {
    id: '3',
    title: 'مقر إداري بالتجمع الأول',
    price: 60000,
    area: 120,
    location: 'التجمع الأول، شارع التسعين',
    type: 'commercial',
    status: 'rent',
    image: 'https://picsum.photos/800/600?random=3',
    bedrooms: 0,
    bathrooms: 2,
    finishing: 'سوبر لوكس',
    description: 'مقر إداري مرخص، يصلح لجميع الأغراض والشركات الكبرى.'
  },
];

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'sale_v1',
    name: 'عقد بيع نهائي',
    content: `
      <h1 style="text-align: center; color: #002147;">عقد بيع ابتدائي</h1>
      <p>أنه في يوم <strong>{{DATE}}</strong>، تم الاتفاق بين:</p>
      <p><strong>الطرف الأول (البائع):</strong> {{SELLER_NAME}}</p>
      <p><strong>الطرف الثاني (المشتري):</strong> {{BUYER_NAME}}</p>
      <h3>تمهيد</h3>
      <p>يمتلك الطرف الأول الوحدة رقم {{UNIT_NO}} الكائنة في {{ADDRESS}}...</p>
      <p>تم البيع نظير مبلغ وقدره <strong>{{PRICE}}</strong> جنيه مصري فقط لا غير.</p>
    `
  },
  {
    id: 'rent_v1',
    name: 'عقد إيجار وحدة',
    content: `
      <h1 style="text-align: center; color: #002147;">عقد إيجار محدد المدة</h1>
      <p>السيد المؤجر: {{SELLER_NAME}}</p>
      <p>السيد المستأجر: {{BUYER_NAME}}</p>
      <p>مدة الإيجار: {{DURATION}} تبدأ من تاريخ {{DATE}}</p>
    `
  }
];