import { fetchActivities, insertActivity, updateActivity, upsertActivity } from '../activities';
import { supabase } from '../../../src/auth/supabase-client';

jest.mock('../../../src/auth/supabase-client', () => {
  const mSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
  };
  return { supabase: mSupabase };
});

describe('activities service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchActivities', () => {
    it('returns activities for user and date range', async () => {
      supabase.order.mockResolvedValueOnce({ data: [{ id: '1', user_id: 'abc', activity: 'prayer' }], error: null });
      const result = await fetchActivities('abc', '2025-06-01', '2025-06-30');
      expect(result).toEqual([{ id: '1', user_id: 'abc', activity: 'prayer' }]);
    });
    it('throws on Supabase error', async () => {
      supabase.order.mockResolvedValueOnce({ data: null, error: new Error('Supabase error') });
      await expect(fetchActivities('abc')).rejects.toThrow('Supabase error');
    });
  });

  describe('insertActivity', () => {
    it('inserts a new activity (mocked)', async () => {
      supabase.single.mockResolvedValueOnce({ data: { id: '2', activity: 'bible' }, error: null });
      const result = await insertActivity({ activity: 'bible' });
      expect(result).toEqual({ id: '2', activity: 'bible' });
    });
    it('throws on Supabase error (mocked)', async () => {
      supabase.single.mockResolvedValueOnce({ data: null, error: new Error('Insert error') });
      await expect(insertActivity({ activity: 'bible' })).rejects.toThrow('Insert error');
    });
  });

  describe('updateActivity', () => {
    it('updates an activity (mocked)', async () => {
      supabase.single.mockResolvedValueOnce({ data: { id: '3', progress: 50 }, error: null });
      const result = await updateActivity('3', { progress: 50 });
      expect(result).toEqual({ id: '3', progress: 50 });
    });
    it('throws on Supabase error (mocked)', async () => {
      supabase.single.mockResolvedValueOnce({ data: null, error: new Error('Update error') });
      await expect(updateActivity('3', { progress: 50 })).rejects.toThrow('Update error');
    });
  });

  describe('upsertActivity', () => {
    it('upserts an activity (mocked)', async () => {
      supabase.single.mockResolvedValueOnce({ data: { id: '4', activity: 'devotional' }, error: null });
      const result = await upsertActivity({ activity: 'devotional' });
      expect(result).toEqual({ id: '4', activity: 'devotional' });
    });
    it('throws on Supabase error (mocked)', async () => {
      supabase.single.mockResolvedValueOnce({ data: null, error: new Error('Upsert error') });
      await expect(upsertActivity({ activity: 'devotional' })).rejects.toThrow('Upsert error');
    });
  });
}); 