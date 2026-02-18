
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
  contactPhones: string[];
  photoUrl: string | null;
  medicalReportUrl: string | null; // Nueva URL para el PDF
  thankYouMessage: string;
  totalAmount: string;
}

export enum ThemeColor {
  PINK = 'pink',
  BLUE = 'blue',
  YELLOW = 'yellow',
  PURPLE = 'purple'
}
