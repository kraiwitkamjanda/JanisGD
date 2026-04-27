export default {
  async fetch(req) {

    // รองรับ CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        }
      });
    }

    try {
      const { token, userId, message } = await req.json();

      const res = await fetch(
        'https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: userId,
          messages: [{ type: 'text', text: message }]
        })
      });

      return new Response(
        JSON.stringify({ ok: res.ok, status: res.status }),
        { headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }}
      );

    } catch(e) {
      return new Response(
        JSON.stringify({ ok: false, error: e.message }),
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' }}
      );
    }
  }
};