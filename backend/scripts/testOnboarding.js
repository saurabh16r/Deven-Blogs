(async () => {
  try {
    const email = `testuser${Date.now()}@deven.io`;
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'Password123' })
    });
    const signupData = await signupRes.json();
    console.log('signupStatus', signupRes.status, signupData);
    if (!signupRes.ok) return;
    const token = signupData.token;
    const onboardRes = await fetch('http://localhost:5000/api/users/onboarding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        founderRole: 'SaaS Startup',
        startupStage: 'Beginner',
        interests: ['Marketing'],
        goals: ['Build MVP'],
        contentPreferences: ['Reading Blogs'],
        skip: false
      })
    });
    const onboardData = await onboardRes.json();
    console.log('onboardStatus', onboardRes.status, onboardData);
  } catch (err) {
    console.error(err);
  }
})();
