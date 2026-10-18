from geometric_engine import hurwitz as hz


def test_tqf_is_sixteen_area_squared():
    # Right triangle with legs 3, 4: area 6 -> A = 16 * 36.
    assert hz.gram_tqf((0, 0), (3, 0), (0, 4)) == 576


def test_collinear():
    assert hz.is_collinear((0, 0), (2, 2), (-5, -5))
    assert not hz.is_collinear((0, 0), (2, 2), (-5, -4))


def test_float64_fails_on_thin_triangle():
    p1, p2, p3 = (-585454, 894496), (321728, 893587), (-821979, 894733)
    assert hz.gram_tqf(p1, p2, p3) == 3305124
    assert hz.gram_tqf_float64(p1, p2, p3) != 3305124


def test_hurwitz_norm_is_multiplicative():
    u = hz.HurwitzQuaternion(1, 1, 1, 1)   # (1+i+j+k)/2, a unit
    q = hz.HurwitzQuaternion(2, 4, 0, -6)  # 1 + 2i - 3k
    assert u.norm() == 1
    assert (u * q).norm() == u.norm() * q.norm() == 14
