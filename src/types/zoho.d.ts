declare global {
  interface Window {
    $zoho?: {
      salesiq?: {
        ready?: () => void;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  }
}

export {};