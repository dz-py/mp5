export async function isValidUrl(url: string): Promise<boolean> {
  try {
    new URL(url);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Make a request to check if the domain exists and is accessible
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return false; // Timeout occurred
      }
      throw error; 
    }
  } catch {
    return false;
  }
}

export async function getUrlValidationError(url: string): Promise<string | null> {
  if (!url) {
    return 'URL is required';
  }
  
  if (!await isValidUrl(url)) {
    return 'Please enter a valid URL';
  }
  
  return null;
} 