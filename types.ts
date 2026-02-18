
export interface Donation {
  id?: string;
  poster_id: string;
  donor_name: string;
  amount: number;
  message?: string;
  proof_url?: string;
  payment_method?: string;
  created_at?: string;
}

export interface PosterData {
  patientName: string;
  condition: string;
  procedure: string;
  location: string;
  description: string;
  zelleEmail: string;
  zelleHolder: string;
  pagoMovilBank: string;
  pagoMovilPhone: string;
  pagoMovilId: string;
  // Nuevos campos
  bankName: string;
  bankAccountNumber: string;
  bankAccountType: string;
  bankAccountHolder: string;
  bankAccountId: string;
  yappyPhone: string;
  yappyHolder: string;
  
  contactPhones: string[];
  photoUrl: string | null;
  medicalReportUrl: string | null;
  thankYouMessage: string;
  totalAmount: string;
}

export enum ThemeColor {
  PINK = 'pink',
  BLUE = 'blue',
  YELLOW = 'yellow',
  PURPLE = 'purple'
}
