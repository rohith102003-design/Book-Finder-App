import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_gmail_auth_and_rejections(client: AsyncClient):
    # 1. Non-gmail registration rejection (Yahoo)
    res1 = await client.post("/api/v1/auth/register", json={
        "email": "user@yahoo.com",
        "username": f"yahoo_{uuid.uuid4().hex[:6]}",
        "password": "Password123!"
    })
    assert res1.status_code in [400, 422]

    # 2. Non-gmail registration rejection (Outlook)
    res2 = await client.post("/api/v1/auth/register", json={
        "email": "user@outlook.com",
        "username": f"outlook_{uuid.uuid4().hex[:6]}",
        "password": "Password123!"
    })
    assert res2.status_code in [400, 422]

    # 3. Non-gmail registration rejection (Company/custom domain)
    res3 = await client.post("/api/v1/auth/register", json={
        "email": "user@company.org",
        "username": f"company_{uuid.uuid4().hex[:6]}",
        "password": "Password123!"
    })
    assert res3.status_code in [400, 422]

    # 4. Valid Gmail registration -> Instant access token without requiring SMTP verification!
    test_email = f"test_{uuid.uuid4().hex[:6]}@gmail.com"
    test_username = f"user_{uuid.uuid4().hex[:6]}"
    res4 = await client.post("/api/v1/auth/register", json={
        "email": test_email,
        "username": test_username,
        "password": "Password123!"
    })
    assert res4.status_code == 201
    data4 = res4.json()["data"]
    assert "access_token" in data4
    assert data4["user"]["email"] == test_email
    assert data4["user"]["email_verified"] is True

    # 5. Valid Gmail login with correct credentials -> Success!
    res5 = await client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "Password123!"
    })
    assert res5.status_code == 200
    assert "access_token" in res5.json()["data"]

    # 6. Login with wrong password -> 401
    res6 = await client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword123!"
    })
    assert res6.status_code == 401

    # 7. Non-Gmail login rejection -> 400/422
    res7 = await client.post("/api/v1/auth/login", json={
        "email": "user@yahoo.com",
        "password": "Password123!"
    })
    assert res7.status_code in [400, 422]

    # 8. Duplicate registration rejection -> 409
    res8 = await client.post("/api/v1/auth/register", json={
        "email": test_email,
        "username": f"diff_{uuid.uuid4().hex[:6]}",
        "password": "Password123!"
    })
    assert res8.status_code == 409
