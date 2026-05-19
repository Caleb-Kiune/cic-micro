export const CIC_RATES = {
  ALL_BENEFITS: {
    OPTION_1: { base: [7789, 10651, 17031, 21187, 23787, 25068, 26989], additional: 3889 },
    OPTION_2: { base: [8789, 12553, 20104, 25023, 28099, 29615, 31889], additional: 4389 },
    OPTION_3: { base: [9789, 14260, 22863, 28467, 31972, 33699, 36289], additional: 4889 },
  },
  INPATIENT_ONLY: {
    OPTION_1: { base: [2597, 2930, 4675, 5811, 6522, 6872, 7397], additional: 1197 },
    OPTION_2: { base: [3297, 4288, 6869, 8550, 9602, 10120, 10897], additional: 1497 },
    OPTION_3: { base: [3897, 5026, 8061, 10037, 11274, 11883, 12797], additional: 1797 },
  },
} as const; 

export const STATUTORY_LEVIES = {
  TRAINING_LEVY_RATE: 0.002,  
  PHCF_RATE: 0.0025,          
  STAMP_DUTY: 40,             
} as const;