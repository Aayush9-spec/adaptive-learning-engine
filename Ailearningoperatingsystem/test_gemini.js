import { GoogleGenerativeAI } from '@google/generative-ai';
async function test() {
    const genAI = new GoogleGenerativeAI('AIzaSyAwl1SxVzZsFoeFG4WiGydhr0tJ_nfoLcE');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    try {
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage('Say hello');
        console.log(result.response.text());
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
