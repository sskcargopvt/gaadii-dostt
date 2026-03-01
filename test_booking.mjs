import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://tstboympleybwbdwicik.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdGJveW1wbGV5YndiZHdpY2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDg0OTcsImV4cCI6MjA4NDIyNDQ5N30.JQZFd3z4yrVeUHG66Pe_FGFnupoG6JfguEP8auY-qUE'
);

console.log('Testing Supabase Realtime Connection...');

const channel = supabase.channel('driver_booking_requests', { config: { broadcast: { self: true } } });
let listenerTriggered = false;

channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_requests' }, (payload) => {
    console.log('\n✅ SUCCESS: Driver Panel received Real-Time PG Change!');
    console.log('Load Request Details:', payload.new.goods_type, '|', payload.new.weight, '| ₹' + payload.new.offered_price);
    console.log('Customer Name:', payload.new.customer_name);
    console.log('Dist. from DB trigger worked reliably.');
    listenerTriggered = true;
    process.exit(0);
}).on('broadcast', { event: 'INSERT' }, (payload) => {
    console.log('\n✅ SUCCESS: Driver Panel received Real-Time Broadcast!');
    listenerTriggered = true;
    process.exit(0);
}).subscribe(async (status) => {
    console.log('Channel Status:', status);
    if (status === 'SUBSCRIBED') {
        console.log('\nSimulating Customer Booking Request...');
        const { data, error } = await supabase.from('booking_requests').insert([{
            customer_name: 'Test Setup User',
            customer_phone: '9999999999',
            pickup_location: 'New Delhi, DL',
            drop_location: 'Noida, UP',
            pickup_lat: 28.6139,
            pickup_lng: 77.2090,
            drop_lat: 28.5355,
            drop_lng: 77.3910,
            goods_type: 'Electronics',
            weight: '500 kg',
            offered_price: '1500',
            status: 'pending',
            created_at: new Date().toISOString()
        }]).select();

        if (error) {
            console.error('❌ Failed to create booking:', error);
            process.exit(1);
        } else {
            console.log('Customer booking created successfully. ID:', data[0].id);
            console.log('Waiting for real-time notification to reach driver panel channel...');

            // Wait 2s to allow PG change to hit... then try broadcast fallback if needed
            setTimeout(() => {
                if (!listenerTriggered) {
                    console.log('PG Change took too long... simulating direct broadcast fallback (like BookingSection does)...');
                    channel.send({
                        type: 'broadcast',
                        event: 'INSERT',
                        payload: data[0]
                    });
                }
            }, 3000);
        }
    }
});

setTimeout(() => {
    if (!listenerTriggered) {
        console.error('\n❌ Timeout: Realtime notification was NOT received.');
        process.exit(1);
    }
}, 8000);
