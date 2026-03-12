export const useToast = () => {
  return {
    toast: ({ title, description }) => {
      console.log(`TOAST: ${title} - ${description}`);
      // In a real app, this would show a popup. 
      // For now, we log it to console to prevent crashes.
    }
  };
};
