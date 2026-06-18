import { getPagination, createPaginatedResult } from '../pagination';

describe('Pagination Utils', () => {
  describe('getPagination', () => {
    it('should use default values if parameters are missing or invalid', () => {
      const result = getPagination({});
      expect(result).toEqual({
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
      });
    });

    it('should clamp limit values to minimum 1 and maximum 100', () => {
      const resultUnder = getPagination({ limit: -5 });
      expect(resultUnder.take).toBe(1);

      const resultOver = getPagination({ limit: 200 });
      expect(resultOver.take).toBe(100);
    });

    it('should calculate skip correctly based on page and limit', () => {
      const result = getPagination({ page: 3, limit: 15 });
      expect(result).toEqual({
        skip: 30,
        take: 15,
        page: 3,
        limit: 15,
      });
    });

    it('should clamp page value to minimum 1', () => {
      const result = getPagination({ page: -1 });
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });
  });

  describe('createPaginatedResult', () => {
    it('should format pagination response correctly', () => {
      const items = ['a', 'b', 'c'];
      const result = createPaginatedResult(items, 25, 2, 10);

      expect(result).toEqual({
        items,
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should calculate totalPages as 0 if total is 0', () => {
      const result = createPaginatedResult([], 0, 1, 10);
      expect(result.totalPages).toBe(0);
    });
  });
});
