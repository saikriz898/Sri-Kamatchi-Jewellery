const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  
  // Smart local-network detection for mobile testing
  if (typeof window !== 'undefined' && 
      url.includes('localhost') && 
      !window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1')) {
    return url.replace('localhost', window.location.hostname);
  }
  
  return url;
};

const API_URL = getApiUrl();
export default API_URL;
