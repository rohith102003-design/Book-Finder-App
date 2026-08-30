import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.book_repository import book_repository
from app.schemas.book import BookCreate


@pytest.mark.asyncio
async def test_book_repository_crud(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL100W",
        title="Neuromancer",
        authors=["William Gibson"],
        first_publish_year=1984,
        cover_url="https://covers.openlibrary.org/b/id/100-L.jpg",
        description="The sky above the port was the color of television.",
        edition_count=20,
        subjects=["Cyberpunk", "Sci-Fi"],
    )

    # Create
    created = await book_repository.create(db_session, book_in)
    assert created.id is not None
    assert created.openlibrary_work_id == "OL100W"
    assert created.title == "Neuromancer"

    # Get by openlibrary ID
    found = await book_repository.get_by_openlibrary_id(db_session, "OL100W")
    assert found is not None
    assert found.id == created.id
    assert found.title == "Neuromancer"

    # Upsert (update existing)
    updated_in = BookCreate(
        openlibrary_work_id="OL100W",
        title="Neuromancer (Sprawl Trilogy)",
        authors=["William Gibson"],
        first_publish_year=1984,
        cover_url="https://covers.openlibrary.org/b/id/100-L.jpg",
        description="Updated synopsis.",
        edition_count=25,
        subjects=["Cyberpunk", "Sci-Fi", "AI"],
    )
    upserted = await book_repository.upsert_by_openlibrary_id(db_session, updated_in)
    assert upserted.id == created.id
    assert upserted.title == "Neuromancer (Sprawl Trilogy)"
    assert upserted.edition_count == 25

    # List books
    books_list = await book_repository.list_books(db_session)
    assert len(books_list) == 1
