import re
from typing import Any, Dict, List, Optional
from urllib.parse import quote_plus
import httpx
from app.core.config import settings
from app.core.exceptions import ExternalApiError, ExternalApiTimeoutError
from app.schemas.book import BookSearchItem, BookSearchResponse


class OpenLibraryService:
    """Service for querying and normalizing external OpenLibrary API requests"""

    def __init__(self):
        self.base_url = settings.OPENLIBRARY_BASE_URL.rstrip("/")
        self.covers_url = settings.OPENLIBRARY_COVERS_BASE_URL.rstrip("/")
        self.timeout = settings.OPENLIBRARY_TIMEOUT_SECONDS

    def _extract_publish_year(self, doc: Dict[str, Any]) -> Optional[int]:
        if isinstance(doc.get("first_publish_year"), int):
            return doc["first_publish_year"]

        publish_years = doc.get("publish_year")
        if isinstance(publish_years, list) and len(publish_years) > 0:
            for y in publish_years:
                if isinstance(y, int):
                    return y

        publish_dates = doc.get("publish_date")
        if publish_dates:
            raw_date = publish_dates[0] if isinstance(publish_dates, list) else str(publish_dates)
            match = re.search(r"\b(18|19|20)\d{2}\b", str(raw_date))
            if match:
                return int(match.group(0))

        return None

    def _extract_description(self, doc: Dict[str, Any]) -> Optional[str]:
        desc = doc.get("description")
        if isinstance(desc, str) and desc.strip():
            return desc.strip()
        if isinstance(desc, dict) and "value" in desc:
            return str(desc["value"]).strip()

        first_sentence = doc.get("first_sentence")
        if isinstance(first_sentence, list) and len(first_sentence) > 0:
            item = first_sentence[0]
            if isinstance(item, str):
                return item.strip()
            if isinstance(item, dict) and "value" in item:
                return str(item["value"]).strip()

        return None

    def _normalize_doc(self, doc: Dict[str, Any]) -> BookSearchItem:
        key = doc.get("key", "")
        title = doc.get("title", "Untitled Book")

        authors = doc.get("author_name")
        if not isinstance(authors, list) or len(authors) == 0:
            authors = ["Unknown Author"]

        cover_i = doc.get("cover_i")
        cover_url = f"{self.covers_url}/b/id/{cover_i}-L.jpg" if cover_i else None

        subjects = doc.get("subject", [])
        if not isinstance(subjects, list):
            subjects = []

        return BookSearchItem(
            key=key,
            title=title,
            authors=authors,
            first_publish_year=self._extract_publish_year(doc),
            cover_url=cover_url,
            description=self._extract_description(doc),
            edition_count=int(doc.get("edition_count", 1)),
            subjects=subjects[:5],
        )

    async def search_books(
        self,
        query: str,
        page: int = 1,
        limit: int = 24,
        client: Optional[httpx.AsyncClient] = None,
    ) -> BookSearchResponse:
        trimmed = query.strip()
        if not trimmed:
            return BookSearchResponse(books=[], total=0, page=page, limit=limit)

        encoded_query = quote_plus(trimmed)
        url = f"{self.base_url}/search.json?title={encoded_query}&page={page}&limit={limit}"

        close_client = False
        if client is None:
            client = httpx.AsyncClient(timeout=self.timeout)
            close_client = True

        try:
            response = await client.get(url)
            if response.status_code != 200:
                raise ExternalApiError(
                    service_name="OpenLibrary",
                    message=f"Received HTTP {response.status_code} from upstream API.",
                    status_code=502,
                )

            data = response.json()
            docs = data.get("docs", [])
            total = data.get("numFound", len(docs))

            normalized_books = [self._normalize_doc(doc) for doc in docs]

            return BookSearchResponse(
                books=normalized_books,
                total=total,
                page=page,
                limit=limit,
            )

        except httpx.TimeoutException:
            raise ExternalApiTimeoutError("OpenLibrary")
        except httpx.RequestError as exc:
            raise ExternalApiError("OpenLibrary", f"Network connection failed: {str(exc)}")
        finally:
            if close_client:
                await client.aclose()

    async def get_work_details(
        self,
        work_id: str,
        client: Optional[httpx.AsyncClient] = None,
    ) -> Dict[str, Any]:
        clean_id = work_id.replace("/works/", "")
        url = f"{self.base_url}/works/{clean_id}.json"

        close_client = False
        if client is None:
            client = httpx.AsyncClient(timeout=self.timeout)
            close_client = True

        try:
            response = await client.get(url)
            if response.status_code == 404:
                return {}
            if response.status_code != 200:
                raise ExternalApiError(
                    service_name="OpenLibrary",
                    message=f"Received HTTP {response.status_code} from upstream API.",
                    status_code=502,
                )

            return response.json()
        except httpx.TimeoutException:
            raise ExternalApiTimeoutError("OpenLibrary")
        except httpx.RequestError as exc:
            raise ExternalApiError("OpenLibrary", f"Network connection failed: {str(exc)}")
        finally:
            if close_client:
                await client.aclose()


openlibrary_service = OpenLibraryService()
