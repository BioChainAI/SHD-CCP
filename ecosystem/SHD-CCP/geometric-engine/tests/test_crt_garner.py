import pytest

from geometric_engine import crt_garner as crt


def test_modulus():
    assert crt.M == 690_017_701


@pytest.mark.parametrize("n", [0, 1, 880, 881, 777_923, crt.M - 1])
def test_round_trip(n):
    assert crt.decode(crt.encode(n)) == n


def test_exhaustive_low_range():
    for n in range(0, 200_000, 7):
        assert crt.decode(crt.encode(n)) == n


def test_range_checks():
    with pytest.raises(ValueError):
        crt.encode(crt.M)
    with pytest.raises(ValueError):
        crt.decode((881, 0, 0))
