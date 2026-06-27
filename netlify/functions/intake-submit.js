const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  let d;
  try { d = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: 'Bad Request' }; }

  const str = (v, max = 999) =>
    (Array.isArray(v) ? v.join(', ') : (v || '')).slice(0, max).trim();

  const lines = [
    `New intake — Local Growth Systems`,
    ``,
    `${str(d.contact_name)}  |  ${str(d.business_name)}`,
    `Phone: ${str(d.phone)}`,
    `Email: ${str(d.email)}`,
    ``,
    `Work: ${str(d.industry, 100)}`,
    `Area: ${str(d.service_area)}`,
    `CTA:  ${str(d.primary_cta)}`,
    ``,
    `Colors: ${str(d.colors)}`,
    d.color_notes ? `Color notes: ${str(d.color_notes, 80)}` : '',
    `Theme:  ${str(d.theme_style)}`,
    `Font:   ${str(d.font_style)}`,
    ``,
    `Sections: ${str(d.sections)}`,
    d.services_list ? `Services: ${str(d.services_list, 120)}` : '',
    d.differentiator ? `Diff: ${str(d.differentiator, 100)}` : '',
    ``,
    `Domain: ${str(d.domain)}`,
    `Package: ${str(d.package)}`,
    d.deadline ? `Deadline: ${str(d.deadline)}` : '',
    d.logo_filename ? `Logo file: ${str(d.logo_filename)} (follow up)` : 'Logo: none uploaded',
    str(d.assets) ? `Assets: ${str(d.assets)}` : '',
    d.reference_sites ? `Refs: ${str(d.reference_sites, 100)}` : '',
    d.reviews ? `Reviews: pasted` : '',
    d.anything_else ? `\nNotes: ${str(d.anything_else, 200)}` : '',
  ].filter(Boolean).join('\n');

  const sid  = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM;
  const to    = process.env.MY_PHONE;

  if (!sid || !token || !from || !to) {
    console.error('Missing Twilio env vars');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: 'Server misconfigured' }) };
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: to, Body: lines }).toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Twilio error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: 'Failed to send text' }) };
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
};
