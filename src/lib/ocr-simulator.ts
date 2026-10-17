import { ReceiptData, ReceiptLineItem } from '@/types';

export interface SampleReceipt {
  id: string;
  name: string;
  merchant: string;
  date: string;
  totalAmount: number;
  suggestedCategoryId: string;
  categoryName: string;
  imageUrl: string;
  lineItems: ReceiptLineItem[];
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'sample_supermarket',
    name: 'Superindo Supermarket',
    merchant: 'PT Lion Super Indo',
    date: '2026-10-17',
    totalAmount: 148500,
    suggestedCategoryId: 'cat_shopping',
    categoryName: 'Belanja',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e49016a3505?w=600&auto=format&fit=crop&q=80',
    lineItems: [
      { id: 'item_1', name: 'Beras Premium Ramos 5kg', price: 74000, quantity: 1 },
      { id: 'item_2', name: 'Minyak Goreng Sania 2L', price: 38500, quantity: 1 },
      { id: 'item_3', name: 'Telur Ayam Negeri 1kg', price: 36000, quantity: 1 },
    ],
  },
  {
    id: 'sample_coffee',
    name: 'Starbucks Coffee Reserve',
    merchant: 'Starbucks Grand Indonesia',
    date: '2026-10-16',
    totalAmount: 85000,
    suggestedCategoryId: 'cat_food',
    categoryName: 'Makanan & Minuman',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    lineItems: [
      { id: 'item_1', name: 'Caffe Latte Grande Oatmilk', price: 58000, quantity: 1 },
      { id: 'item_2', name: 'Butter Croissant Warm', price: 27000, quantity: 1 },
    ],
  },
  {
    id: 'sample_gas',
    name: 'SPBU Pertamina 31.129',
    merchant: 'Pertamina Retail Rasuna Said',
    date: '2026-10-15',
    totalAmount: 250000,
    suggestedCategoryId: 'cat_transport',
    categoryName: 'Transportasi',
    imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=80',
    lineItems: [
      { id: 'item_1', name: 'Pertamax Green 95 (18.2L)', price: 250000, quantity: 1 },
    ],
  },
];

/**
 * Simulates OCR extraction on a receipt image or file.
 */
export async function simulateOcrExtraction(
  imageSource: File | string,
  sampleId?: string
): Promise<ReceiptData> {
  // Simulate network & AI model inference latency (1.2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (sampleId) {
    const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId);
    if (sample) {
      return {
        merchant: sample.merchant,
        date: sample.date,
        totalAmount: sample.totalAmount,
        receiptImageUrl: sample.imageUrl,
        lineItems: sample.lineItems,
        suggestedCategoryId: sample.suggestedCategoryId,
        confidenceScore: 98,
      };
    }
  }

  // If a File is passed, generate data URL for preview
  let imageUrl = 'https://images.unsplash.com/photo-1554415707-9e49016a3505?w=600&auto=format&fit=crop&q=80';
  if (typeof imageSource !== 'string' && imageSource instanceof File) {
    try {
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(imageUrl);
        reader.readAsDataURL(imageSource);
      });
    } catch {
      // fallback to placeholder
    }
  } else if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  }

  // Intelligent OCR parsed mock for arbitrary uploaded receipt
  const randomTotal = Math.floor(Math.random() * 8 + 3) * 25000;
  return {
    merchant: 'Nota Pembelian / Struk Toko',
    date: new Date().toISOString().split('T')[0],
    totalAmount: randomTotal,
    receiptImageUrl: imageUrl,
    lineItems: [
      { id: 'item_1', name: 'Item Belanja A', price: Math.floor(randomTotal * 0.6), quantity: 1 },
      { id: 'item_2', name: 'Item Belanja B', price: Math.floor(randomTotal * 0.4), quantity: 1 },
    ],
    suggestedCategoryId: 'cat_shopping',
    confidenceScore: 94,
  };
}
