/**
 * Validation functions
 */
export const Validators = {
  id: (value: number) => {
    if (value < 1) throw new Error('Invalid ID');
  },
  
  string: (maxLength: number = 255) => (value: string) => {
    if (!value || value.length > maxLength) throw new Error('Invalid string');
  },
  
  page: (value: number) => {
    if (value < 0) throw new Error('Invalid page number');
  },
  
  required: (value: any) => {
    if (!value) throw new Error('Required parameter missing');
  }
};