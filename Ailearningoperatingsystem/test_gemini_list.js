import { GoogleGenerativeAI } from '@google/generative-ai';
async function test() {
    const apiKey = 'AIzaSyAwl1SxVzZsFoeFG4WiGydhr0tJ_nfoLcE';
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        console.log(data.models.map(m => m.name).join('\n'));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
