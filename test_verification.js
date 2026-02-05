const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    try {
        console.log('--- Starting Verification ---');

        // Helper for requests
        const request = async (endpoint, method, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await res.json();
            if (!res.ok) {
                console.error(`Request to ${endpoint} failed with ${res.status}:`, data);
            }
            return { status: res.status, data };
        };

        // 1. Register Admin
        const adminEmail = `admin_${Date.now()}@test.com`;
        console.log(`1. Registering Admin: ${adminEmail}`);
        await request('/auth/register', 'POST', {
            email: adminEmail,
            password: 'password123',
            fullName: 'Admin Tester',
            role: 'ADMIN'
        });

        // 2. Login Admin
        console.log('2. Logging in Admin');
        const adminLogin = await request('/auth/login', 'POST', {
            email: adminEmail,
            password: 'password123'
        });
        if (!adminLogin.data.success) throw new Error('Admin login failed');
        const adminToken = adminLogin.data.token;
        console.log('   Admin Token received');

        // 3. Create Plan
        console.log('3. Creating Test Plan');
        const planRes = await request('/admin/plans', 'POST', {
            name: `Gold Plan ${Date.now()}`,
            description: 'Best plan',
            price: 50,
            duration: 30,
            features: ['a', 'b']
        }, adminToken);

        if (!planRes.data.success) throw new Error('Plan creation failed');
        const planId = planRes.data.plan.id;
        console.log(`   Plan Created: ${planId}`);

        // 4. Register User
        const userEmail = `user_${Date.now()}@test.com`;
        console.log(`4. Registering User: ${userEmail}`);
        await request('/auth/register', 'POST', {
            email: userEmail,
            password: 'password123',
            fullName: 'User Tester',
            role: 'USER'
        });

        // 5. Login User
        console.log('5. Logging in User');
        const userLogin = await request('/auth/login', 'POST', {
            email: userEmail,
            password: 'password123'
        });
        const userToken = userLogin.data.token;
        console.log('   User Token received');

        // 6. Subscribe to Plan
        console.log('6. Subscribing to Plan');
        const subRes = await request('/subscriptions/subscribe', 'POST', {
            planId
        }, userToken);
        if (!subRes.data.success) throw new Error('Subscription failed');
        console.log('   Subscription Successful');

        // 7. Verify My Subscription
        console.log('7. Verifying My Subscription');
        const mySub = await request('/subscriptions/my-subscription', 'GET', null, userToken);
        if (mySub.data.subscription.planId === planId) {
            console.log('   Subscription matches Plan ID');
        } else {
            throw new Error('Subscription Plan ID mismatch');
        }

        // 8. Attempt Duplicate Subscription (Should Fail)
        console.log('8. Attempting Duplicate Subscription');
        const dupRes = await request('/subscriptions/subscribe', 'POST', {
            planId
        }, userToken);

        if (dupRes.status === 409) {
            console.log('   SUCCESS: Duplicate subscription rejected (409 Conflict)');
        } else {
            console.error('   FAILED: Duplicate subscription was allowed or wrong error!');
            throw new Error(`Expected 409, got ${dupRes.status}`);
        }

        // 9. Admin Check Subscriptions
        console.log('9. Admin Checking Subscriptions');
        const allSubs = await request('/admin/subscriptions', 'GET', null, adminToken);
        const foundSub = allSubs.data.subscriptions.find(s => s.User.email === userEmail);
        if (foundSub) {
            console.log('   Admin found the user subscription');
        } else {
            throw new Error('Admin could not find the user subscription');
        }

        console.log('--- Verification Completed Successfully ---');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
        process.exit(1);
    }
};

runVerification();
