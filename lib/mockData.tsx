export interface Candidate {
  id: string;
  name: string;
  party: string;
  manifesto: string;
  photo?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "ongoing" | "upcoming" | "ended";
  candidates: Candidate[];
}

export const mockElections: Election[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "2026 Presidential Election",
    description: "Choose the next President of the Federal Republic of Nigeria",
    startDate: "2026-04-25",
    endDate: "2026-04-26",
    status: "ongoing",
    candidates: [
      { id: "2d111111-1111-4111-8111-111111111111", name: "Aisha Bello", party: "APC", manifesto: "Economic growth and job creation for all Nigerians" },
      { id: "2d222222-2222-4222-8222-222222222222", name: "Emeka Okoro", party: "PDP", manifesto: "Security, justice and national unity" },
      { id: "2d333333-3333-4333-8333-333333333333", name: "Fatima Yusuf", party: "Labour Party", manifesto: "Youth empowerment and digital transformation" },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Lagos State Governor Election",
    description: "Elect the Governor of Lagos State",
    startDate: "2026-05-10",
    endDate: "2026-05-11",
    status: "upcoming",
    candidates: [
      { id: "3d111111-1111-4111-8111-111111111111", name: "Tunde Adewale", party: "APC", manifesto: "Smart city and infrastructure development" },
      { id: "3d222222-2222-4222-8222-222222222222", name: "Chinwe Nwosu", party: "PDP", manifesto: "Better roads and healthcare access" },
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "National Assembly Election",
    description: "Elect Senators and House of Representatives members",
    startDate: "2026-04-20",
    endDate: "2026-04-21",
    status: "ended",
    candidates: [
      { id: "4d111111-1111-4111-8111-111111111111", name: "John Okafor", party: "APC", manifesto: "Legislative reforms" },
    ],
  },
];