import httpx
import pytest
from app.core.exceptions import ExternalApiError, ExternalApiTimeoutError
from app.services.openlibrary_service import OpenLibraryService


@pytest.fixture
def service():
    return OpenLibraryService()


def test_extract_publish_year_formats(service: OpenLibraryService):
    assert service._extract_publish_year({"first_publish_year": 1954}) == 1954
    assert service._extract_publish_year({"publish_year": [1984, 1990]}) == 1984
    assert service._extract_publish_year({"publish_date": ["June 8, 1949"]}) == 1949
    assert service._extract_publish_year({}) is None


def test_extract_description_formats(service: OpenLibraryService):
    assert service._extract_description({"description": "Direct text."}) == "Direct text."
    assert service._extract_description({"description": {"value": "Nested value."}}) == "Nested value."
    assert service._extract_description({"first_sentence": ["First sentence here."]}) == "First sentence here."
    assert service._extract_description({}) is None


@pytest.mark.asyncio
async def test_search_books_empty_query(service: OpenLibraryService):
    result = await service.search_books(query="   ")
    assert result.books == []
    assert result.total == 0


@pytest.mark.asyncio
async def test_search_books_success_mock(service: OpenLibraryService):
    mock_payload = {
        "numFound": 1,
        "docs": [
            {
                "key": "/works/OL45804W",
                "title": "Harry Potter",
                "author_name": ["J.K. Rowling"],
                "first_publish_year": 1997,
                "cover_i": 10521270,
                "subject": ["Wizards"],
            }
        ],
    }

    mock_transport = httpx.MockTransport(
        lambda request: httpx.Response(200, json=mock_payload)
    )

    async with httpx.AsyncClient(transport=mock_transport) as mock_client:
        result = await service.search_books(query="Harry Potter", client=mock_client)
        assert result.total == 1
        assert len(result.books) == 1
        book = result.books[0]
        assert book.title == "Harry Potter"
        assert book.authors == ["J.K. Rowling"]
        assert book.first_publish_year == 1997


@pytest.mark.asyncio
async def test_search_books_timeout(service: OpenLibraryService):
    def raise_timeout(request):
        raise httpx.ReadTimeout("Connection timed out", request=request)

    mock_transport = httpx.MockTransport(raise_timeout)

    async with httpx.AsyncClient(transport=mock_transport) as mock_client:
        with pytest.raises(ExternalApiTimeoutError):
            await service.search_books(query="Timeout Test", client=mock_client)


@pytest.mark.asyncio
async def test_search_books_500_error(service: OpenLibraryService):
    mock_transport = httpx.MockTransport(
        lambda request: httpx.Response(500, text="Internal Server Error")
    )

    async with httpx.AsyncClient(transport=mock_transport) as mock_client:
        with pytest.raises(ExternalApiError):
            await service.search_books(query="Server Error Test", client=mock_client)
