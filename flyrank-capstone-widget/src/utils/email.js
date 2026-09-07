/**
 * Safe Side Effect
 * This simulates sending an email or webhook. 
 * If it fails, we catch the error so it doesn't crash the main submission path.
 */

async function triggerWebhook(submissionData) {
  try {
    // Simulate some async side-effect, e.g. calling Mailpit or an external webhook
    console.log('[Side Effect] Simulating email/webhook sending...', submissionData.id);
    
    // Simulating a random failure for testing robustness (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Simulated network timeout during webhook delivery');
    }
    
    console.log('[Side Effect] Email/Webhook sent successfully.');
  } catch (error) {
    // We log the error but DO NOT throw it further, keeping the side-effect "safe"
    console.error('[Side Effect Failed] Non-critical error:', error.message);
  }
}

module.exports = { triggerWebhook };
