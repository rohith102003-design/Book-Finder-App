from unittest.mock import AsyncMock, patch
import pytest
from httpx import AsyncClient
from app.schemas.book import BookSearchItem, BookSearchResponse


@pytest.mark.asyncio
async def test_search_books_api_success(client: AsyncClient):
    mock_search_response = BookSearchResponse(
        books=[
            BookSearchItem(
                key="/works/OL123W",
                title="The Fellowship of the Ring",
                authors=["J.R.R. Tolkien"],
                first_publish_year=1954,
                cover_url="https://covers.openlibrary.org/b/id/123-L.jpg",
                description="The first part of The Lord of the Rings.",
                edition_count=50,
                subjects=["Fantasy"],
            )
        ],
        total=1,
        page=1,
        limit=24,
    )

    with patch(
        "app.services.book_service.openlibrary_service.search_books",
        new_callable=AsyncMock,
    ) as mock_search:
        mock_search.return_value = mock_search_response

        response = await client.get("/api/v1/books/search?q=Tolkien")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert len(payload["data"]["books"]) == 1
        assert payload["data"]["books"][0]["title"] == "The Fellowship of the Ring"
        assert payload["meta"]["query"] == "Tolkien"


@pytest.mark.asyncio
async def test_search_books_api_missing_query(client: AsyncClient):
    response = await client.get("/api/v1/books/search")
    assert response.status_code == 422  # Unprocessable Entity for missing required 'q' param


@pytest.mark.asyncio
async def test_get_book_details_persists_to_db(client: AsyncClient):
    mock_work_data = {
        "title": "Dune",
        "description": "Set on the desert planet Arrakis.",
        "covers": [105123],
        "subjects": ["Science Fiction", "Space Opera"],
    }

    with patch(
        "app.services.book_service.openlibrary_service.get_work_details",
        new_callable=AsyncMock,
    ) as mock_work:
        mock_work.return_value = mock_work_data

        # 1. Fetch book (will fetch from mock and insert into DB)
        response = await client.get("/api/v1/books/OL899W")
        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert payload["data"]["title"] == "Dune"
        assert payload["data"]["openlibrary_work_id"] == "OL899W"

        # 2. Fetch again (should be retrieved directly from DB without calling OpenLibrary)
        mock_work.reset_mock()
        second_response = await client.get("/api/v1/books/OL899W")
        assert second_response.status_code == 200
        mock_work.assert_not_called()


@pytest.mark.asyncio
async def test_get_book_details_not_found(client: AsyncClient):
    with patch(
        "app.services.book_service.openlibrary_service.get_work_details",
        new_callable=AsyncMock,
    ) as mock_work:
        mock_work.return_value = {}  # 404 from upstream

        response = await client.get("/api/v1/books/OL_NON_EXISTENT")
        assert response.status_code == 404
        payload = response.json()
        assert payload["success"] is False
        assert payload["error"]["code"] == "BOOK_NOT_FOUND"
