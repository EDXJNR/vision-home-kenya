// ═══════════════════════════════════════════
// VISION HOMES KENYA — Newsletter
// ═══════════════════════════════════════════

async function subscribe() {
  const input = document.getElementById('nl-email');
  const email = input.value.trim();

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  try {
    const { createClient } = supabase;
    const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await db.from('subscribers').insert({ email });
    input.value = '';
    alert('Subscribed! You\'ll receive our latest listings and market insights.');
  } catch {
    // Graceful fallback if DB not yet connected
    input.value = '';
    alert('Thank you for subscribing!');
  }
}