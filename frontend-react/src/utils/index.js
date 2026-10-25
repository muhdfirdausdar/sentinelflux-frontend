// Utility functions
export const formatDate = (dateString, timeZone = 'Asia/Singapore') => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const adjustedDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return adjustedDate.toLocaleString('en-US', { timeZone });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

export const validateDomainId = (id) => {
  return id && !isNaN(Number(id)) && Number(id) > 0;
};

export const validateDomainName = (domain) => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domain && domainRegex.test(domain);
};

export const scrollToElement = (selector, behavior = 'smooth') => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior });
  }
};

export const navigateTo = (path) => {
  window.location.href = path;
};
