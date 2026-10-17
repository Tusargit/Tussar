/* TUSSAR route request integration. WhatsApp ordering continues if backend is not configured. */
(function(){
  const cfg = window.TUSSAR_BACKEND || {};
  const ready = typeof window.supabase !== 'undefined' &&
    /^https:\/\//.test(cfg.supabaseUrl || '') &&
    cfg.supabaseAnonKey && !String(cfg.supabaseAnonKey).startsWith('PASTE_');
  let client = null;
  if (ready) {
    try { client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey); }
    catch (e) { console.error('TUSSAR backend initialisation failed:', e); }
  }
  window.TUSSAR_ROUTE_BACKEND_READY = !!client;
  window.saveTussarRouteRequest = async function(order) {
    if (!client) {
      console.info('Route request not stored centrally yet: configure Supabase in supabase-config.js.');
      return {saved:false, reason:'backend-not-configured'};
    }
    const payload = {
      order_code: String(order.order_code || '').slice(0,80),
      customer_name: String(order.customer_name || '').trim().slice(0,100),
      phone: String(order.phone || '').trim().slice(0,25),
      product: order.product,
      quantity: Math.max(1, Number(order.quantity) || 1),
      subtotal: Math.max(0, Number(order.subtotal) || 0),
      preferred_day: String(order.preferred_day || '').slice(0,20),
      distance_band: order.distance_band,
      fulfilment: order.fulfilment === 'pickup' ? 'pickup' : 'delivery',
      area: String(order.area || '').trim().slice(0,120),
      address: String(order.address || '').trim().slice(0,1000)
    };
    try {
      const {data,error} = await client.from('route_requests').insert(payload).select('order_code').single();
      if (error) throw error;
      return {saved:true, data};
    } catch (error) {
      console.error('TUSSAR route request could not be saved:', error);
      return {saved:false, reason:error.message || 'save-failed'};
    }
  };
})();
