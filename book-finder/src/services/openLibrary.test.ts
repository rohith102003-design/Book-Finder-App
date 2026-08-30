import {
  extractPublishYear,
  extractDescription,
  normalizeBookDoc,
  searchBooksByTitle,
} from './openLibrary';
import { OpenLibraryDoc } from '../types/book';

describe('openLibrary service', () => {
  describe('extractPublishYear', () => {
    it('extracts year from first_publish_year number', () => {
      const doc: OpenLibraryDoc = { key: '1', title: 'Test', first_publish_year: 1997 };
      expect(extractPublishYear(doc)).toBe(1997);
    });

    it('extracts year from publish_year array', () => {
      const doc: OpenLibraryDoc = { key: '1', title: 'Test', publish_year: [2005, 2008] };
      expect(extractPublishYear(doc)).toBe(2005);
    });

    it('extracts 4-digit year from publish_date string', () => {
      const doc: OpenLibraryDoc = { key: '1', title: 'Test', publish_date: 'October 12, 1985' };
      expect(extractPublishYear(doc)).toBe(1985);
    });

    it('returns null when no valid year format exists', () => {
      const doc: OpenLibraryDoc = { key: '1', title: 'Test' };
      expect(extractPublishYear(doc)).toBeNull();
    });
  });

  describe('extractDescription', () => {
    it('extracts plain string description', () => {
      const doc: OpenLibraryDoc = { key: '1', title: 'Test', description: 'A great fantasy book.' };
      expect(extractDescription(doc)).toBe('A great fantasy book.');
    });

    it('extracts description from object with value key', () => {
      const doc: OpenLibraryDoc = {
        key: '1',
        title: 'Test',
        description: { type: '/type/text', value: 'Nested text synopsis.' },
      };
      expect(extractDescription(doc)).toBe('Nested text synopsis.');
    });

    it('falls back to first_sentence when description is missing', () => {
      const doc: OpenLibraryDoc = {
        key: '1',
        title: 'Test',
        first_sentence: ['The boy who lived came to number 4 Privet Drive.'],
      };
      expect(extractDescription(doc)).toBe('The boy who lived came to number 4 Privet Drive.');
    });

    it('returns null when no description is present', () => {
      const doc: OpenLibraryDoc = { key: '1', title: 'Test' };
      expect(extractDescription(doc)).toBeNull();
    });
  });

  describe('normalizeBookDoc', () => {
    it('normalizes raw OpenLibrary doc into clean Book entity', () => {
      const rawDoc: OpenLibraryDoc = {
        key: '/works/OL45804W',
        title: "Harry Potter and the Philosopher's Stone",
        author_name: ['J.K. Rowling'],
        first_publish_year: 1997,
        cover_i: 10521270,
        subject: ['Magic', 'Wizards', 'Hogwarts'],
        edition_count: 42,
      };

      const normalized = normalizeBookDoc(rawDoc);

      expect(normalized.key).toBe('/works/OL45804W');
      expect(normalized.title).toBe("Harry Potter and the Philosopher's Stone");
      expect(normalized.authors).toEqual(['J.K. Rowling']);
      expect(normalized.firstPublishYear).toBe(1997);
      expect(normalized.coverUrl).toBe('https://covers.openlibrary.org/b/id/10521270-L.jpg');
      expect(normalized.editionCount).toBe(42);
      expect(normalized.subjects).toEqual(['Magic', 'Wizards', 'Hogwarts']);
    });

    it('provides defaults when fields are missing in raw doc', () => {
      const rawDoc: OpenLibraryDoc = {
        key: '/works/OL999W',
        title: '',
      };

      const normalized = normalizeBookDoc(rawDoc);

      expect(normalized.title).toBe('Untitled Book');
      expect(normalized.authors).toEqual(['Unknown Author']);
      expect(normalized.coverUrl).toBeNull();
      expect(normalized.firstPublishYear).toBeNull();
      expect(normalized.editionCount).toBe(1);
    });
  });

  describe('searchBooksByTitle', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('returns empty result without fetching if query is empty or whitespace', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      const result = await searchBooksByTitle('   ');

      expect(result).toEqual({ books: [], total: 0 });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('successfully parses results from backend proxy response', async () => {
      const mockBackendPayload = {
        success: true,
        data: {
          books: [
            {
              key: '/works/OL123W',
              title: 'Dune',
              authors: ['Frank Herbert'],
              first_publish_year: 1965,
              cover_url: 'https://covers.openlibrary.org/b/id/123-L.jpg',
              description: 'Epic science fiction novel.',
              edition_count: 20,
              subjects: ['Sci-Fi'],
            },
          ],
          total: 1,
          page: 1,
          limit: 24,
        },
      };

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendPayload,
      } as Response);

      const result = await searchBooksByTitle('Dune');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/books/search?q=Dune'),
        expect.any(Object)
      );
      expect(result.books.length).toBe(1);
      expect(result.books[0].title).toBe('Dune');
      expect(result.books[0].firstPublishYear).toBe(1965);
      expect(result.total).toBe(1);
    });

    it('falls back to direct OpenLibrary API when backend is unavailable', async () => {
      const mockOpenLibraryPayload = {
        numFound: 1,
        docs: [
          {
            key: '/works/OL456W',
            title: 'Hyperion',
            author_name: ['Dan Simmons'],
            first_publish_year: 1989,
          },
        ],
      };

      // First fetch (backend) fails with network error, second fetch (direct OpenLibrary) succeeds
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Backend connection refused'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOpenLibraryPayload,
        } as Response);

      const result = await searchBooksByTitle('Hyperion');

      expect(result.books.length).toBe(1);
      expect(result.books[0].title).toBe('Hyperion');
      expect(result.total).toBe(1);
    });

    it('throws error when both backend and direct fallback fail', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Backend unreachable'))
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response);

      await expect(searchBooksByTitle('Error Case')).rejects.toThrow(
        /OpenLibrary API responded with status 500/
      );
    });
  });
});
