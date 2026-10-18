//! Closed-form Garner CRT over (881, 883, 887) (RFC 02).

pub const MODULI: [u32; 3] = [881, 883, 887];
pub const M: u32 = 690_017_701;
/// 881^-1 mod 883.
const C12: u32 = 441;
/// (881 * 883)^-1 mod 887.
const C123: u32 = 37;

/// Returns `None` if `n >= M`.
pub const fn encode(n: u32) -> Option<[u16; 3]> {
    if n >= M {
        return None;
    }
    Some([(n % 881) as u16, (n % 883) as u16, (n % 887) as u16])
}

/// Returns `None` if any residue is out of range for its modulus.
pub const fn decode(r: [u16; 3]) -> Option<u32> {
    let (r1, r2, r3) = (r[0] as u32, r[1] as u32, r[2] as u32);
    if r1 >= 881 || r2 >= 883 || r3 >= 887 {
        return None;
    }
    let v2 = (r2 + 883 - r1 % 883) % 883 * C12 % 883;
    let t = (r1 + 881 * v2) % 887;
    let v3 = (r3 + 887 - t) % 887 * C123 % 887;
    Some(r1 + 881 * v2 + 777_923 * v3)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip() {
        for n in (0..200_000).step_by(7).chain([M - 1]) {
            assert_eq!(decode(encode(n).unwrap()), Some(n));
        }
        assert_eq!(encode(M), None);
        assert_eq!(decode([881, 0, 0]), None);
    }
}
