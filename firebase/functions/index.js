import { createHash } from 'node:crypto';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

const ALLOWED_EVENT_TYPES = new Set([
  'content_tried',
  'feature_used',
  'category_viewed',
  'mood_selected',
  'app_opened',
  'level_reached',
]);

const ALLOWED_CONTENT_TYPES = new Set(['position', 'foreplay', 'oral', 'massage', 'roleplay', 'session']);
const MAX_PROPERTY_LENGTH = 80;
const IDEMPOTENCY_TTL_HOURS = 48;
const RATE_LIMIT_MAX_PER_HOUR = 120;

function normalizeString(value, max = MAX_PROPERTY_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function hashKey(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 32);
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function toHourKey(date) {
  return date.toISOString().slice(0, 13);
}

function sanitizeEventPayload(data) {
  const eventType = normalizeString(data?.eventType);
  const contentType = normalizeString(data?.contentType);
  const category = normalizeString(data?.category);
  const mood = normalizeString(data?.mood);
  const feature = normalizeString(data?.feature);
  const level = Number.isInteger(data?.level) ? data.level : null;

  if (!ALLOWED_EVENT_TYPES.has(eventType)) {
    throw new HttpsError('invalid-argument', 'Unsupported event type.');
  }
  if (contentType && !ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new HttpsError('invalid-argument', 'Unsupported content type.');
  }
  if (level !== null && (level < 0 || level > 1000)) {
    throw new HttpsError('invalid-argument', 'Invalid level.');
  }

  return {
    eventType,
    contentType,
    category,
    mood,
    feature,
    level,
  };
}

export const ingestAnonymousEvent = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: false,
    consumeAppCheckToken: false,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const payload = sanitizeEventPayload(request.data || {});
    const idempotencyKey = normalizeString(request.data?.idempotencyKey, 96);
    if (!idempotencyKey || idempotencyKey.length < 16) {
      throw new HttpsError('invalid-argument', 'Missing or invalid idempotencyKey.');
    }

    const now = new Date();
    const dateKey = toDateKey(now);
    const hourKey = toHourKey(now);
    const subjectHash = hashKey(request.auth.uid);
    const dedupeDocId = hashKey(`${subjectHash}:${idempotencyKey}`);
    const rateDocId = `${hourKey}:${subjectHash}`;
    const dedupeRef = db.collection('idempotency_keys').doc(dedupeDocId);
    const rateRef = db.collection('rate_limits').doc(rateDocId);
    const dailyRef = db.collection('analytics_daily').doc(dateKey);

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(dedupeRef);
      if (existing.exists) {
        throw new HttpsError('already-exists', 'Duplicate event ignored.');
      }

      const rateSnap = await tx.get(rateRef);
      const currentCount = rateSnap.exists ? Number(rateSnap.data()?.count || 0) : 0;
      if (currentCount >= RATE_LIMIT_MAX_PER_HOUR) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded.');
      }

      tx.set(
        dedupeRef,
        {
          createdAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromDate(new Date(now.getTime() + IDEMPOTENCY_TTL_HOURS * 60 * 60 * 1000)),
          eventType: payload.eventType,
          subjectHash,
        },
        { merge: false }
      );

      tx.set(
        rateRef,
        {
          updatedAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromDate(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
          count: FieldValue.increment(1),
          subjectHash,
        },
        { merge: true }
      );

      const updates = {
        updatedAt: FieldValue.serverTimestamp(),
        totalEvents: FieldValue.increment(1),
        [`events.${payload.eventType}`]: FieldValue.increment(1),
      };

      if (payload.contentType) updates[`contentTypes.${payload.contentType}`] = FieldValue.increment(1);
      if (payload.category) updates[`categories.${payload.category}`] = FieldValue.increment(1);
      if (payload.mood) updates[`moods.${payload.mood}`] = FieldValue.increment(1);
      if (payload.feature) updates[`features.${payload.feature}`] = FieldValue.increment(1);
      if (typeof payload.level === 'number') updates[`levels.${payload.level}`] = FieldValue.increment(1);

      tx.set(dailyRef, updates, { merge: true });
    });

    return { ok: true };
  }
);

export const refreshDailyJokeOfTheDay = onSchedule(
  {
    region: 'us-central1',
    schedule: '5 0 * * *',
    timeZone: 'Etc/UTC',
    retryCount: 3,
  },
  async () => {
    const date = new Date();
    const dateKey = toDateKey(date);
    const jokesRef = db.collection('app_config').doc('daily_jokes');
    const todayRef = db.collection('app_config').doc('daily_joke_today');

    const jokesSnap = await jokesRef.get();
    if (!jokesSnap.exists) {
      logger.warn('daily_jokes config missing');
      return;
    }

    const jokesData = jokesSnap.data() || {};
    const setups = Array.isArray(jokesData.setups) ? jokesData.setups.filter((v) => typeof v === 'string' && v.trim()) : [];
    const punchlines = Array.isArray(jokesData.punchlines) ? jokesData.punchlines.filter((v) => typeof v === 'string' && v.trim()) : [];

    if (setups.length < 10 || punchlines.length < 10) {
      logger.warn('daily_jokes config rejected: insufficient setup/punchline entries');
      return;
    }

    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const setupIndex = (dayOfYear - 1 + setups.length) % setups.length;
    const punchlineIndex = (dayOfYear * 13 + date.getFullYear()) % punchlines.length;

    await todayRef.set(
      {
        dateKey,
        setup: setups[setupIndex],
        punchline: punchlines[punchlineIndex],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);

export const queueReactivationCandidates = onSchedule(
  {
    region: 'us-central1',
    schedule: '15 */6 * * *',
    timeZone: 'Etc/UTC',
    retryCount: 1,
  },
  async () => {
    const now = Date.now();
    const inactiveAfter = Timestamp.fromMillis(now - 3 * 24 * 60 * 60 * 1000);
    const staleBefore = Timestamp.fromMillis(now - 30 * 24 * 60 * 60 * 1000);

    const usersSnap = await db
      .collection('users')
      .where('pushOptIn', '==', true)
      .where('lastActiveAt', '<=', inactiveAfter)
      .where('lastActiveAt', '>=', staleBefore)
      .limit(200)
      .get();

    if (usersSnap.empty) return;

    const batch = db.batch();
    usersSnap.docs.forEach((docSnap) => {
      const payload = docSnap.data();
      const token = normalizeString(payload.pushToken, 300);
      if (!token) return;
      const entryRef = db.collection('reactivation_queue').doc();
      batch.set(entryRef, {
        userRef: docSnap.ref.path,
        queuedAt: FieldValue.serverTimestamp(),
        status: 'queued',
        expiresAt: Timestamp.fromMillis(now + 14 * 24 * 60 * 60 * 1000),
      });
    });

    await batch.commit();
  }
);

export const logNotificationFailure = onCall(
  { region: 'us-central1', enforceAppCheck: false, consumeAppCheckToken: false },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const reason = normalizeString(request.data?.reason, 180);
    const channel = normalizeString(request.data?.channel, 60);
    const notificationType = normalizeString(request.data?.notificationType, 60);

    if (!reason || !channel || !notificationType) {
      throw new HttpsError('invalid-argument', 'Missing required fields.');
    }

    await db.collection('notification_failures').add({
      channel,
      notificationType,
      reason,
      userHash: hashKey(request.auth.uid),
      createdAt: FieldValue.serverTimestamp(),
    });

    return { ok: true };
  }
);

export const cleanupExpiredOperationalData = onSchedule(
  {
    region: 'us-central1',
    schedule: '35 3 * * *',
    timeZone: 'Etc/UTC',
    retryCount: 1,
  },
  async () => {
    const now = Timestamp.now();
    const collections = ['idempotency_keys', 'rate_limits', 'reactivation_queue'];

    for (const collectionName of collections) {
      const snap = await db
        .collection(collectionName)
        .where('expiresAt', '<=', now)
        .limit(400)
        .get();

      if (snap.empty) continue;

      const batch = db.batch();
      snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      logger.info('Expired operational records cleaned', { collectionName, count: snap.size });
    }
  }
);
