import { NextResponse } from 'next/server';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import { collection, doc, getDoc, getCountFromServer, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // If it's not a message update, ignore
    if (!body || !body.message) {
      return NextResponse.json({ ok: true });
    }

    const { chat, text } = body.message;

    if (!chat || !chat.id) {
      return NextResponse.json({ ok: true });
    }

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const authorizedChatId = process.env.TELEGRAM_CHAT_ID;

    if (!telegramToken || !authorizedChatId) {
      return NextResponse.json({ error: 'Telegram environment variables not configured' }, { status: 500 });
    }

    // Security check: Only respond to authorized chat ID
    if (chat.id.toString() !== authorizedChatId.toString()) {
      await sendTelegramMessage(telegramToken, chat.id, `⚠️ Bu bota erişim yetkiniz bulunmamaktadır.`);
      return NextResponse.json({ ok: true });
    }

    const command = text?.trim().toLowerCase();

    if (command === '/start' || command === '/help') {
      const welcomeText = `🤖 <b>errenn.com İletişim & İstatistik Botu</b>\n\n` +
        `Kullanabileceğiniz komutlar:\n` +
        `📊 /stats - Günlük, haftalık ve aylık görüntülenme özetleri\n` +
        `📝 /mesajlar - En son gelen 5 iletişim formu mesajı\n` +
        `📅 /gunluk - Bugün en çok görüntülenen sayfalar\n` +
        `📆 /haftalik - Son 7 günün günlük görüntülenme grafiği`;
      await sendTelegramMessage(telegramToken, chat.id, welcomeText);
    } 
    else if (command === '/stats') {
      const stats = await getStats();
      const statsText = `📊 <b>errenn.com İstatistikleri</b>\n\n` +
        `👁️ <b>Bugün Görüntülenme:</b> ${stats.todayTotal}\n` +
        `📅 <b>Bu Hafta (Son 7 Gün):</b> ${stats.weeklyTotal}\n` +
        `📆 <b>Bu Ay (Son 30 Gün):</b> ${stats.monthlyTotal}\n\n` +
        `✉️ <b>Toplam İletişim Mesajı:</b> ${stats.messagesCount}`;
      await sendTelegramMessage(telegramToken, chat.id, statsText);
    } 
    else if (command === '/gunluk') {
      const stats = await getStats();
      let pathDetails = '';
      if (Object.keys(stats.todayPaths).length > 0) {
        pathDetails = Object.entries(stats.todayPaths)
          .map(([p, count]) => `• <code>${p}</code>: ${count} kez`)
          .join('\n');
      } else {
        pathDetails = 'Bugün henüz görüntülenme kaydedilmedi.';
      }
      
      const gunlukText = `📅 <b>Bugünün Sayfa Görüntülenmeleri</b>\n\n` +
        `<b>Toplam Hit:</b> ${stats.todayTotal}\n\n` +
        `<b>Sayfalara Göre Dağılım:</b>\n${pathDetails}`;
      await sendTelegramMessage(telegramToken, chat.id, gunlukText);
    } 
    else if (command === '/haftalik') {
      const haftalikReport = await getWeeklyReport();
      await sendTelegramMessage(telegramToken, chat.id, haftalikReport);
    }
    else if (command === '/mesajlar') {
      const latest = await getLatestMessages(5);
      if (latest.length === 0) {
        await sendTelegramMessage(telegramToken, chat.id, '📝 Henüz gelen mesaj bulunmuyor.');
      } else {
        let msgList = `📝 <b>Son 5 İletişim Mesajı:</b>\n\n`;
        latest.forEach((m: any, i: number) => {
          const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : 'Bilinmeyen Tarih';
          msgList += `${i + 1}. 👤 <b>${m.name}</b> (${m.email})\n` +
            `📌 <b>Konu:</b> ${m.subject}\n` +
            `🕒 <b>Tarih:</b> ${dateStr}\n` +
            `💬 <b>Mesaj:</b> ${m.message}\n\n` +
            `──────────────────\n\n`;
        });
        await sendTelegramMessage(telegramToken, chat.id, msgList);
      }
    } 
    else {
      await sendTelegramMessage(telegramToken, chat.id, `❓ Bilinmeyen komut. Komut listesi için /help yazabilirsiniz.`);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}

async function sendTelegramMessage(token: string, chatId: number | string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Failed to send telegram message in webhook response:', err);
  }
}

async function getStats() {
  if (!isFirebaseEnabled || !db) {
    return { todayTotal: 0, todayPaths: {}, weeklyTotal: 0, monthlyTotal: 0, messagesCount: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Fetch today's doc
  const todayDocSnap = await getDoc(doc(db, 'views', todayStr));
  const todayTotal = todayDocSnap.exists() ? (todayDocSnap.data().total || 0) : 0;
  const todayPaths = todayDocSnap.exists() ? (todayDocSnap.data().paths || {}) : {};

  // 2. Weekly (Last 7 Days)
  let weeklyTotal = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const docSnap = await getDoc(doc(db, 'views', dStr));
    weeklyTotal += docSnap.exists() ? (docSnap.data().total || 0) : 0;
  }

  // 3. Monthly (Last 30 Days)
  let monthlyTotal = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const docSnap = await getDoc(doc(db, 'views', dStr));
    monthlyTotal += docSnap.exists() ? (docSnap.data().total || 0) : 0;
  }

  // 4. Contact messages count
  const countSnap = await getCountFromServer(collection(db, 'submissions'));
  const messagesCount = countSnap.data().count;

  return {
    todayTotal,
    todayPaths,
    weeklyTotal,
    monthlyTotal,
    messagesCount,
  };
}

async function getWeeklyReport() {
  if (!isFirebaseEnabled || !db) {
    return '⚠️ Firebase bağlantısı aktif değil.';
  }

  let report = '📆 <b>Son 7 Günlük Görüntülenme Grafiği</b>\n\n';
  let totalViews = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    
    const docSnap = await getDoc(doc(db, 'views', dStr));
    const total = docSnap.exists() ? (docSnap.data().total || 0) : 0;
    totalViews += total;

    const parts = dStr.split('-');
    const formattedDate = `${parts[2]}.${parts[1]}`;
    
    const barLength = Math.min(Math.round(total / 5), 15);
    const bar = '■'.repeat(barLength) + (barLength === 0 && total > 0 ? '▫' : '');
    
    report += `📅 ${formattedDate}: ${total} hit ${bar ? `\n   ${bar}` : ''}\n`;
  }

  report += `\n<b>Toplam Görüntülenme:</b> ${totalViews}`;
  return report;
}

async function getLatestMessages(count = 5) {
  if (!isFirebaseEnabled || !db) {
    return [];
  }

  try {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list;
  } catch (error) {
    console.error('Failed to query submissions in webhook:', error);
    return [];
  }
}
