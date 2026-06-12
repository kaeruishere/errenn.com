import { NextResponse } from 'next/server';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { pagePath } = await request.json();
    const cleanPath = pagePath || '/';

    const today = new Date().toISOString().split('T')[0];
    let todayTotal = 0;

    if (!isFirebaseEnabled || !db) {
      return NextResponse.json({ error: 'Firebase is not configured.' }, { status: 500 });
    }

    const docRef = doc(db, 'views', today);
    const docSnap = await getDoc(docRef);

    let todayData = {
      total: 0,
      paths: {} as Record<string, number>,
      updatedAt: new Date().toISOString()
    };

    if (docSnap.exists()) {
      const data = docSnap.data();
      todayData.total = data.total || 0;
      todayData.paths = data.paths || {};
    }

    todayData.total += 1;
    todayData.paths[cleanPath] = (todayData.paths[cleanPath] || 0) + 1;
    todayData.updatedAt = new Date().toISOString();

    await setDoc(docRef, todayData);
    todayTotal = todayData.total;
    console.log('Page view tracked in Firebase Firestore');

    // Notify Telegram if configured
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const notifyOnView = process.env.TELEGRAM_NOTIFY_VIEWS === 'true';

    if (telegramToken && telegramChatId && notifyOnView) {
      const telegramText = `👁️ <b>Yeni Görüntülenme</b>\n\n` +
        `📍 <b>Sayfa:</b> <code>${cleanPath}</code>\n` +
        `📅 <b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}\n` +
        `📈 <b>Bugün Toplam:</b> ${todayTotal}`;

      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            parse_mode: 'HTML',
          }),
        });
      } catch (tgError) {
        console.error('Failed to send view notification to Telegram:', tgError);
      }
    }

    return NextResponse.json({ success: true, todayTotal });
  } catch (error) {
    console.error('Views API Error:', error);
    return NextResponse.json({ error: 'Failed to log view' }, { status: 500 });
  }
}
