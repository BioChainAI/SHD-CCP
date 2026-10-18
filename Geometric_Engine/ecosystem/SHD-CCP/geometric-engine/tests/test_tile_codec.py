import pytest

from geometric_engine import tile_codec as tc


def test_pack_unpack_round_trip():
    t = tc.pack(5, 0xA5, 0x0000_00FF_0123_4567 & tc.PAYLOAD_MASK)
    assert tc.form_id(t) == 5
    assert tc.south_halo(t) == 0xA5
    assert tc.pack(tc.form_id(t), tc.south_halo(t), tc.payload(t)) == t


def test_masks_partition_the_word():
    assert tc.PAYLOAD_MASK | tc.FORM_ID_MASK | tc.SOUTH_HALO_MASK == tc.TILE_MASK
    assert tc.PAYLOAD_MASK & (tc.FORM_ID_MASK | tc.SOUTH_HALO_MASK) == 0


@pytest.mark.parametrize("bad", [-1, 1 << 64])
def test_rejects_out_of_range(bad):
    with pytest.raises(ValueError):
        tc.form_id(bad)


def test_payload_may_not_overlap_reserved_bits():
    with pytest.raises(ValueError):
        tc.pack(0, 0, tc.FORM_ID_MASK)
