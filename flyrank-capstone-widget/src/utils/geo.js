/**
 * Geo Enrichment with Fallback Chain
 * Provider A: ip-api.com
 * Provider B: ipapi.co
 */

async function getGeoData(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return null; // Localhost bypass
  }

  try {
    // Try Provider A
    const resA = await fetch(`http://ip-api.com/json/${ip}`);
    if (resA.ok) {
      const data = await resA.json();
      if (data.status === 'success') {
        return {
          provider: 'ip-api.com',
          country: data.country,
          city: data.city,
          region: data.regionName
        };
      }
    }
  } catch (error) {
    console.warn('Provider A (ip-api.com) failed:', error.message);
  }

  try {
    // Try Provider B
    const resB = await fetch(`https://ipapi.co/${ip}/json/`);
    if (resB.ok) {
      const data = await resB.json();
      if (!data.error) {
        return {
          provider: 'ipapi.co',
          country: data.country_name,
          city: data.city,
          region: data.region
        };
      }
    }
  } catch (error) {
    console.warn('Provider B (ipapi.co) failed:', error.message);
  }

  // Both providers failed
  console.warn('All geo providers failed for IP:', ip);
  return null; 
}

module.exports = { getGeoData };
