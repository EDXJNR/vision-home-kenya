// Newsletter subscription handler.
// Inserts emails into `public.subscribers`.

async function subscribe() {
  const input = document.getElementById('nl-email');
  if (!input) return;

  const email = input.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail) {
    alert('Please enter a valid email address.');
    return;
  }

  const db = typeof getDB === 'function' ? getDB() : null;
  if (!db) {
    alert('Subscription service is unavailable right now. Please try again shortly.');
    return;
  }

  try {
    const { error } = await db.from('subscribers').insert({ email });
    if (error) {
      // Handle duplicate-email style messages gracefully.
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('unique')) {
        alert('This email is already subscribed.');
      } else {
        throw error;
      }
    } else {
      alert("Subscribed! You'll receive our latest listings and market insights.");
    }
    input.value = '';
  } catch (err) {
    console.error('Subscribe failed:', err);
    alert('Could not complete subscription right now. Please try again.');
  }
}
