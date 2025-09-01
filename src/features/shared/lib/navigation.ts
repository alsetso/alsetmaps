// Simple navigation utility for migration
export const navigate = (path: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
};

export const useRouter = () => {
  return {
    push: navigate,
    replace: navigate,
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };
};
