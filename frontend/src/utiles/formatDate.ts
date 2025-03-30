export const formatDate = (timestamp?: Date) => {
    if (!timestamp) {
      return "No date available";
    }
    return new Date(timestamp).toLocaleString();
  };
  